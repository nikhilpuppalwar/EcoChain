const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const ESGReport = require('../models/ESGReport');
const cloudinaryUtil = require('../utils/cloudinary');

const PYTHON_SERVICE = process.env.PYTHON_REPORT_SERVICE_URL || 'http://localhost:8001';

/**
 * Safely extract a plain string message from an axios error.
 * Avoids passing circular-reference-containing objects into res.json().
 */
function safeErrDetail(err) {
    try {
        if (err.response) {
            const d = err.response.data;
            if (typeof d === 'string') return d;
            if (d && typeof d === 'object') {
                return d.detail || d.message || d.error || JSON.stringify(d);
            }
        }
    } catch (_) { /* ignore serialisation errors */ }
    return err.message || 'Unknown error';
}

// All report routes require authentication
router.use(verifyToken);

/**
 * GET /api/reports/past
 * Retrieve all successfully generated ESG reports for the logged in company.
 */
router.get('/past', async (req, res, next) => {
    try {
        const reports = await ESGReport.find({ company: req.user.company, status: 'completed' })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/status/:jobId
 * Polls the Python AI service for the readiness of the generated report.
 * Intercepts completion to download the file and upload to Cloudinary.
 */
router.get('/status/:jobId', async (req, res) => {
    try {
        const pyRes = await axios.get(`${PYTHON_SERVICE}/report-status/${req.params.jobId}`);
        const stData = pyRes.data;

        // Find the corresponding DB record
        const localReport = await ESGReport.findOne({ jobId: req.params.jobId });

        if (stData.status === 'completed' && stData.report) {
            if (localReport && localReport.status === 'pending') {
                try {
                    const filename = stData.report;
                    // Download file as arraybuffer from Python service
                    const fileRes = await axios.get(
                        `${PYTHON_SERVICE}/download/${encodeURIComponent(filename)}`,
                        { responseType: 'arraybuffer', timeout: 30000 }
                    );
                    const buffer = Buffer.from(fileRes.data);

                    // Upload buffer to Cloudinary
                    const cloudinaryUrl = await cloudinaryUtil.uploadFile(
                        buffer,
                        filename,
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    );

                    // Save details in MongoDB
                    localReport.url = cloudinaryUrl;
                    localReport.size = `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`;
                    localReport.status = 'completed';
                    await localReport.save();

                    stData.cloudinaryUrl = cloudinaryUrl;
                } catch (uploadErr) {
                    console.error('Failed to upload completed report to Cloudinary:', uploadErr.message);
                }
            } else if (localReport && localReport.status === 'completed') {
                stData.cloudinaryUrl = localReport.url;
            }
        } else if (stData.status === 'failed') {
            if (localReport && localReport.status === 'pending') {
                localReport.status = 'failed';
                await localReport.save();
            }
        }

        res.json(stData);
    } catch (err) {
        const detail = safeErrDetail(err);
        return res.status(err.response ? err.response.status : 503).json({ error: 'Status fetch failed', detail });
    }
});

/**
 * GET /api/reports/download/:filename
 * Proxies the file stream from Python to the client (Fallback mode).
 */
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const fileRes = await axios.get(
            `${PYTHON_SERVICE}/download/${encodeURIComponent(filename)}`,
            { responseType: 'stream', timeout: 30000 }
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        fileRes.data.on('error', (streamErr) => {
            console.error('Stream error:', streamErr.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error', detail: streamErr.message });
            } else {
                res.end();
            }
        });
        fileRes.data.pipe(res);
    } catch (err) {
        const detail = safeErrDetail(err);
        return res.status(err.response ? err.response.status : 502).json({ error: 'Could not download generated report', detail });
    }
});

/**
 * POST /api/reports/generate-async
 * Kicks off report generation in the background and registers the job in DB.
 */
router.post('/generate-async', async (req, res) => {
    try {
        const payload = req.body;
        const genRes = await axios.post(`${PYTHON_SERVICE}/generate-report-async`, payload);
        
        // Register the pending report in our database
        const newReport = new ESGReport({
            company: req.user.company,
            jobId: genRes.data.job_id,
            name: `${payload.company || 'Company'} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
            type: 'ESG',
            status: 'pending'
        });
        await newReport.save();

        res.json({ success: true, jobId: genRes.data.job_id });
    } catch (err) {
        const status = err.response ? err.response.status : 503;
        const detail = err.code === 'ECONNREFUSED'
            ? 'Please ensure the Python FastAPI service is running on port 8001.'
            : safeErrDetail(err);
        return res.status(status).json({ error: 'Async job dispatch failed', detail });
    }
});

/**
 * POST /api/reports/generate
 * Sync generation fallback: generates and uploads to Cloudinary automatically.
 */
router.post('/generate', async (req, res) => {
    try {
        const payload = req.body;

        let genData;
        try {
            const genRes = await axios.post(
                `${PYTHON_SERVICE}/generate-report`,
                payload,
                { timeout: 120000 }
            );
            genData = genRes.data;
        } catch (err) {
            const status = err.response ? err.response.status : 503;
            const detail = err.code === 'ECONNREFUSED'
                ? 'Please ensure the Python FastAPI service is running on port 8001.'
                : safeErrDetail(err);
            return res.status(status).json({ error: 'Report generation failed', detail });
        }

        const reportPath = genData.report;
        const filename   = reportPath.split(/[\\/]/).pop();

        let fileRes;
        try {
            fileRes = await axios.get(
                `${PYTHON_SERVICE}/download/${encodeURIComponent(filename)}`,
                { responseType: 'arraybuffer', timeout: 30000 }
            );
        } catch (err) {
            const detail = safeErrDetail(err);
            return res.status(502).json({ error: 'Could not download generated report', detail });
        }

        const buffer = Buffer.from(fileRes.data);
        let cloudinaryUrl = '';
        try {
            cloudinaryUrl = await cloudinaryUtil.uploadFile(
                buffer,
                filename,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );

            // Log it in DB
            const newReport = new ESGReport({
                company: req.user.company,
                jobId: `sync_${Date.now()}`,
                name: `${payload.company || 'Company'} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
                type: 'ESG',
                size: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`,
                url: cloudinaryUrl,
                status: 'completed'
            });
            await newReport.save();
        } catch (uploadErr) {
            console.error('Sync upload failed:', uploadErr.message);
        }

        // Return URL and proxy info
        res.json({
            success: true,
            report: filename,
            cloudinaryUrl,
            downloadUrl: cloudinaryUrl || `/api/reports/download/${encodeURIComponent(filename)}`
        });

    } catch (err) {
        console.error('Unexpected report route error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Unexpected error', detail: err.message });
        }
    }
});

module.exports = router;
