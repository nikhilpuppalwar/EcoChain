/**
 * reports.routes.js
 *
 * Node.js backend for reports.
 * Delegates actual ESG report generation asynchronously to the Python AI service
 * located at `ai/Report_Generator`.
 *
 * Flow:
 * 1. POST /api/reports/generate-async:
 *    - Node.js backend forwards payload to Python `/generate-report-async`
 *    - Node.js saves a record in MongoDB with status: 'processing'
 *    - Returns jobId immediately to frontend
 *
 * 2. GET /api/reports/status/:jobId:
 *    - Frontend polls this status endpoint.
 *    - Node.js checks MongoDB: if completed/failed, return immediately.
 *    - If processing, Node.js calls Python `/report-status/:jobId`.
 *    - If completed, Node.js downloads docx from Python `/download/:filename`,
 *      uploads it to Cloudinary, stores the Cloudinary URL in MongoDB,
 *      and updates status to 'completed'.
 */

'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const ESGReport = require('../models/ESGReport');
const cloudinaryUtil = require('../utils/cloudinary');

const DEFAULT_PYTHON_URL = process.env.NODE_ENV === 'production'
    ? 'https://ecochain-ai-reports.onrender.com'
    : 'http://localhost:8001';

const PYTHON_SERVICE_URL = process.env.PYTHON_REPORT_API_URL || DEFAULT_PYTHON_URL;

/**
 * Helper: Download a .docx from the Python service and upload it to Cloudinary.
 * Updates the ESGReport document in-place and returns the cloudinary URL.
 */
async function downloadAndUpload(report, filename) {
    const cleanBaseUrl = PYTHON_SERVICE_URL.replace(/\/generate-report$/, '');

    // Download the generated file from Python microservice
    const downloadRes = await axios.get(
        `${cleanBaseUrl}/download/${encodeURIComponent(filename)}`,
        { responseType: 'arraybuffer', timeout: 30000 }
    );

    const buffer = Buffer.from(downloadRes.data);
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

    // Upload to Cloudinary
    const cloudinaryUrl = await cloudinaryUtil.uploadFile(
        buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    // Persist results to MongoDB
    report.status = 'completed';
    report.url = cloudinaryUrl;
    report.size = `${sizeMB} MB`;
    await report.save();

    return cloudinaryUrl;
}

router.use(verifyToken);

// GET /api/reports/past
router.get('/past', async (req, res, next) => {
    try {
        // Return completed AND failed/stuck reports so users can retry failed uploads
        const reports = await ESGReport
            .find({ company: req.user.company, status: { $in: ['completed', 'failed'] } })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        next(err);
    }
});

// POST /api/reports/generate-async
router.post('/generate-async', async (req, res) => {
    try {
        const d = req.body;

        // Validation
        const required = [
            'company', 'industry', 'revenue',
            'diesel', 'petrol', 'coal', 'electricity',
            'transport_distance', 'cargo_weight',
            'waste_generated', 'waste_recycled',
            'employees', 'female_employees', 'board_members', 'female_directors',
        ];
        for (const k of required) {
            if (d[k] === undefined || d[k] === null || d[k] === '') {
                return res.status(400).json({ success: false, message: `Missing required field: ${k}` });
            }
        }

        // Call the Python AI Report service
        let pythonRes;
        try {
            // Trim URL to base host/port
            const cleanBaseUrl = PYTHON_SERVICE_URL.replace(/\/generate-report$/, '');
            pythonRes = await axios.post(`${cleanBaseUrl}/generate-report-async`, {
                company: d.company,
                industry: d.industry,
                revenue: parseFloat(d.revenue),
                diesel: parseFloat(d.diesel),
                petrol: parseFloat(d.petrol),
                coal: parseFloat(d.coal),
                electricity: parseFloat(d.electricity),
                transport_distance: parseFloat(d.transport_distance),
                cargo_weight: parseFloat(d.cargo_weight),
                waste_generated: parseFloat(d.waste_generated),
                waste_recycled: parseFloat(d.waste_recycled),
                employees: parseInt(d.employees, 10),
                female_employees: parseInt(d.female_employees, 10),
                board_members: parseInt(d.board_members, 10),
                female_directors: parseInt(d.female_directors, 10),
            }, { timeout: 10000 });
        } catch (err) {
            console.error('[Node Backend] Failed to communicate with Python AI Report microservice:', err.message);
            return res.status(503).json({
                success: false,
                message: 'Python AI Report microservice is currently offline. Please ensure the Python service is running on port 8001.',
            });
        }

        const jobId = pythonRes.data.job_id;

        // Create initial pending record in MongoDB
        const report = await ESGReport.create({
            company: req.user.company,
            jobId: jobId,
            name: `${d.company} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
            type: 'ESG',
            size: '0 MB',
            url: '',
            status: 'pending',
        });

        return res.json({ success: true, jobId });
    } catch (err) {
        console.error('[Node Backend] Error creating async job:', err.message);
        res.status(500).json({ success: false, message: 'Failed to initialize report generation', detail: err.message });
    }
});

// GET /api/reports/status/:jobId
router.get('/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        // Find report in MongoDB
        const report = await ESGReport.findOne({ jobId });
        if (!report) {
            return res.status(404).json({ success: false, status: 'not_found', message: 'Job not found' });
        }

        // If already completed AND has a valid URL, return immediately
        if (report.status === 'completed' && report.url) {
            return res.json({
                status: 'completed',
                cloudinaryUrl: report.url,
                report: report.name,
            });
        }

        // If marked failed (and no retry requested), return immediately
        if (report.status === 'failed') {
            return res.json({
                status: 'failed',
                error: 'Report generation previously failed. Use the repair endpoint to retry.',
            });
        }

        // Call the Python AI Report service to check status
        const cleanBaseUrl = PYTHON_SERVICE_URL.replace(/\/generate-report$/, '');
        let pythonStatusRes;
        try {
            pythonStatusRes = await axios.get(`${cleanBaseUrl}/report-status/${jobId}`, { timeout: 10000 });
        } catch (err) {
            console.error(`[Node Backend] Failed to fetch status for job ${jobId}:`, err.message);
            // Don't mark as failed in DB yet, just return processing and hope it recovers next poll
            return res.json({ status: 'processing' });
        }

        const pythonData = pythonStatusRes.data;

        if (pythonData.status === 'completed') {
            const filename = pythonData.report;

            // Download from Python + upload to Cloudinary via shared helper
            let cloudinaryUrl;
            try {
                cloudinaryUrl = await downloadAndUpload(report, filename);
            } catch (upErr) {
                console.error('[Node Backend] Cloudinary upload failed during async report completion:', upErr.message);
                // Keep status as pending so next poll re-tries — don't mark failed yet
                return res.json({ status: 'processing' });
            }

            return res.json({
                status: 'completed',
                cloudinaryUrl: cloudinaryUrl,
                report: report.name,
            });
        } else if (pythonData.status === 'failed') {
            // Update record in MongoDB
            report.status = 'failed';
            await report.save();
            return res.json({ status: 'failed', error: pythonData.error || 'Report generation failed' });
        }

        return res.json({ status: 'processing' });
    } catch (err) {
        console.error('[Node Backend] Error checking job status:', err.message);
        res.status(500).json({ error: 'Status fetch failed', detail: err.message });
    }
});

// POST /api/reports/generate (delegates to async endpoint)
router.post('/generate', (req, res, next) => {
    req.url = '/generate-async';
    router.handle(req, res, next);
});

/**
 * POST /api/reports/repair/:reportId
 * Re-download the .docx from the Python service and re-upload to Cloudinary.
 * Used to fix past reports that completed generation but have an empty/missing URL
 * (e.g. because Cloudinary credentials were not configured at the time).
 */
router.post('/repair/:reportId', async (req, res) => {
    try {
        const report = await ESGReport.findById(req.params.reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Derive the expected filename from the report name
        // Report name format: "<Company> ESG Report <Month> <Year>"
        // Filename format: "<Company>_ESG_Report.docx"
        const company = report.name
            .replace(/\s+ESG Report.*$/, '')  // strip " ESG Report Jun 2026"
            .trim();
        const safeCompany = company.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/ /g, '_');
        const filename = `${safeCompany}_ESG_Report.docx`;

        const cleanBaseUrl = PYTHON_SERVICE_URL.replace(/\/generate-report$/, '');

        // Verify file still exists on Python service
        let headCheck;
        try {
            headCheck = await axios.head(
                `${cleanBaseUrl}/download/${encodeURIComponent(filename)}`,
                { timeout: 8000 }
            );
        } catch (err) {
            return res.status(503).json({
                success: false,
                message: `Generated file '${filename}' is no longer available on the AI service. ` +
                         'Please regenerate this report from the form.',
            });
        }

        // Re-download and upload to Cloudinary
        let cloudinaryUrl;
        try {
            cloudinaryUrl = await downloadAndUpload(report, filename);
        } catch (upErr) {
            console.error('[Node Backend] Repair: Cloudinary upload failed:', upErr.message);
            return res.status(500).json({ success: false, message: 'Cloudinary upload failed: ' + upErr.message });
        }

        return res.json({ success: true, cloudinaryUrl });
    } catch (err) {
        console.error('[Node Backend] Repair error:', err.message);
        res.status(500).json({ success: false, message: 'Repair failed: ' + err.message });
    }
});

module.exports = router;
