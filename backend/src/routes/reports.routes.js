/**
 * reports.routes.js
 *
 * Faithful Node.js port of:
 *   ai/Report_Generator/backend/report_generator.py
 *   ai/Report_Generator/backend/calculations.py
 *   ai/Report_Generator/backend/api.py
 *
 * Generates a comprehensive 18-section .docx ESG report with:
 *   - Parallel AI narrative generation via OpenRouter
 *   - Scope 1/2/3 bar chart embedded in the document
 *   - Full environmental metrics table
 *   - Cloudinary upload for persistent hosting
 *   - MongoDB record for past-reports list
 *
 * No Python microservice required.
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const axios    = require('axios');
const { verifyToken } = require('../middleware/auth');
const ESGReport       = require('../models/ESGReport');
const cloudinaryUtil  = require('../utils/cloudinary');

const {
    Document, Packer, Paragraph, TextRun,
    Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, ShadingType,
    Header, Footer, PageNumberElement,
    HeadingLevel, convertInchesToTwip, PageBreak, ImageRun,
} = require('docx');

// ─── 1. CALCULATIONS (port of calculations.py) ─────────────────────────────────
function calculateEmissions(d) {
    // Same factors as calculations.py
    const scope1 = (d.diesel || 0) * 2.68 + (d.petrol || 0) * 2.31 + (d.coal || 0) * 2.42;
    const scope2 = (d.electricity || 0) * 0.708;
    const scope3 = (d.transport_distance || 0) * (d.cargo_weight || 0) * 0.00012;
    const total  = scope1 + scope2 + scope3;

    const revenue        = d.revenue        || 1;
    const wasteGenerated = d.waste_generated || 1;
    const employees      = d.employees      || 1;
    const boardMembers   = d.board_members  || 1;

    return {
        scope1:           +scope1.toFixed(3),
        scope2:           +scope2.toFixed(3),
        scope3:           +scope3.toFixed(3),
        total:            +total.toFixed(3),
        carbon_intensity: +(total / revenue).toFixed(6),
        recycle_rate:     +((d.waste_recycled || 0) / wasteGenerated).toFixed(4),
        female_ratio:     +((d.female_employees || 0) / employees).toFixed(4),
        board_diversity:  +((d.female_directors || 0) / boardMembers).toFixed(4),
    };
}

// ─── 2. CHART GENERATION (port of matplotlib bar chart) ────────────────────────
async function generateBarChart(scope1, scope2, scope3) {
    try {
        const { createCanvas } = require('@napi-rs/canvas');
        const W = 640, H = 400;
        const canvas = createCanvas(W, H);
        const ctx    = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);

        const bars   = [
            { label: 'Scope 1', value: scope1, color: '#FF6B6B' },
            { label: 'Scope 2', value: scope2, color: '#FFB347' },
            { label: 'Scope 3', value: scope3, color: '#4ECDC4' },
        ];
        const maxVal = Math.max(scope1, scope2, scope3, 1);
        const pad    = { top: 40, bottom: 70, left: 80, right: 40 };
        const plotH  = H - pad.top - pad.bottom;
        const plotW  = W - pad.left - pad.right;
        const barW   = (plotW / bars.length) * 0.5;
        const gap    = (plotW / bars.length) * 0.5;

        // Y-axis label
        ctx.save();
        ctx.translate(18, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#333';
        ctx.font      = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('tCO₂e', 0, 0);
        ctx.restore();

        // Gridlines
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth   = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH - (i / 5) * plotH;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            ctx.fillStyle  = '#666';
            ctx.font       = '11px sans-serif';
            ctx.textAlign  = 'right';
            ctx.fillText(((maxVal * i) / 5).toFixed(1), pad.left - 6, y + 4);
        }

        // Bars
        bars.forEach((bar, i) => {
            const barH = (bar.value / maxVal) * plotH;
            const x    = pad.left + i * (barW + gap) + gap / 2;
            const y    = pad.top + plotH - barH;

            ctx.fillStyle = bar.color;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fill();

            // Value label on top
            ctx.fillStyle  = '#333';
            ctx.font       = 'bold 12px sans-serif';
            ctx.textAlign  = 'center';
            ctx.fillText(bar.value.toFixed(2), x + barW / 2, y - 8);

            // X-axis label
            ctx.fillStyle  = '#555';
            ctx.font       = '13px sans-serif';
            ctx.fillText(bar.label, x + barW / 2, H - pad.bottom + 22);
        });

        // Title
        ctx.fillStyle  = '#111827';
        ctx.font       = 'bold 15px sans-serif';
        ctx.textAlign  = 'center';
        ctx.fillText('Emission Distribution by Scope (tCO₂e)', W / 2, 24);

        return canvas.toBuffer('image/png');
    } catch (err) {
        console.warn('[ESG] Chart generation skipped:', err.message);
        return null;
    }
}

// ─── 3. AI SECTION GENERATION (port of generate_section) ───────────────────────
const SECTIONS = [
    '1. Executive Summary',
    '2. Corporate Identity and Overview',
    '3. Macro Environmental Impact',
    '4. Carbon Reduction Master Strategy',
    '5. Direct Emission Profile (Scope 1)',
    '6. Indirect Energy Emissions (Scope 2)',
    '7. Value Chain Emissions (Scope 3)',
    '8. Emission Analysis and Distribution',
    '9. Waste Management and Recycling Protocols',
    '10. Water Resource Utilization',
    '11. Renewable Energy Transition Models',
    '12. Supply Chain Sustainability',
    '13. Social Responsibility and Workforce Demographics',
    '14. Corporate Governance & Board Diversity',
    '15. GHG Protocol Verification and Compliance',
    '16. Climate Risk Factors and TCFD Alignment',
    '17. Future Sustainability Roadmap 2030',
    '18. Concluding Remarks and Commitments',
];

function fallbackSection(title, d, metrics) {
    return (
        `This section covers ${title} for ${d.company} operating in the ${d.industry} sector. ` +
        `Based on the reported data, total Scope 1 emissions are ${metrics.scope1} tCO₂e, ` +
        `Scope 2 emissions are ${metrics.scope2} tCO₂e, and ` +
        `Scope 3 (value chain) emissions are ${metrics.scope3} tCO₂e, ` +
        `yielding a combined footprint of ${metrics.total} tCO₂e. ` +
        `Carbon intensity relative to annual revenue (USD ${(d.revenue || 0).toLocaleString()}) is ` +
        `${metrics.carbon_intensity} tCO₂e per USD. ` +
        `Waste recycling rate stands at ${(metrics.recycle_rate * 100).toFixed(1)}%. ` +
        `Female workforce representation is ${(metrics.female_ratio * 100).toFixed(1)}% ` +
        `and board diversity is ${(metrics.board_diversity * 100).toFixed(1)}%. ` +
        `The organisation is advised to implement a structured emission reduction roadmap aligned with ` +
        `GHG Protocol standards and ISO 14064 requirements to demonstrate continued commitment to ` +
        `environmental stewardship and regulatory compliance. ` +
        `Adopting science-based targets in line with the Paris Agreement will further strengthen ` +
        `stakeholder confidence and support long-term business resilience against climate-related risks.`
    );
}

async function generateSectionAI(title, d, metrics, apiKey) {
    if (!apiKey || apiKey.startsWith('your_') || apiKey.length < 10) {
        return fallbackSection(title, d, metrics);
    }

    const prompt =
        `Write a professional ESG carbon audit report section titled "${title}".\n\n` +
        `Company: ${d.company}\nIndustry: ${d.industry}\nRevenue: USD ${(d.revenue || 0).toLocaleString()}\n\n` +
        `Scope 1: ${metrics.scope1} tCO₂e\nScope 2: ${metrics.scope2} tCO₂e\nScope 3: ${metrics.scope3} tCO₂e\n` +
        `Total: ${metrics.total} tCO₂e\nCarbon Intensity: ${metrics.carbon_intensity} tCO₂e/USD\n` +
        `Recycle Rate: ${(metrics.recycle_rate * 100).toFixed(1)}%\n` +
        `Female Workforce: ${(metrics.female_ratio * 100).toFixed(1)}%\n` +
        `Board Diversity: ${(metrics.board_diversity * 100).toFixed(1)}%\n\n` +
        `Write about sustainability strategy, risks, compliance and environmental impact. ` +
        `Generate a highly detailed, comprehensive 300-word analysis. Be extremely thorough.`;

    try {
        const res = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://ecochain.app',
                    'X-Title': 'EcoChain ESG Report Generator',
                },
                timeout: 30000,
            }
        );
        const text = res.data?.choices?.[0]?.message?.content?.trim();
        return text && text.length > 40 ? text : fallbackSection(title, d, metrics);
    } catch (err) {
        console.warn(`[ESG] LLM failed for "${title}":`, err.message);
        return fallbackSection(title, d, metrics);
    }
}

// ─── 4. DOCX BUILDER (port of generate_report) ─────────────────────────────────
async function buildReport(d, metrics, sectionTexts, chartBuf) {
    const GREEN    = '1A7A4A';
    const DKGREY   = '1E293B';
    const LTGREY   = 'F1F5F9';
    const MIDGREY  = '64748B';
    const NONE     = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const ROW_LINE = { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' };

    const now        = new Date();
    const reportDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // ── Helpers ──
    const para = (text, opts = {}) => new Paragraph({
        children: [new TextRun({ text, size: opts.size || 22, color: opts.color || '334155', bold: opts.bold || false, italics: opts.italic || false })],
        alignment: opts.align || AlignmentType.JUSTIFIED,
        spacing: { after: opts.after !== undefined ? opts.after : 180 },
    });

    const heading1 = (text) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 30, color: GREEN, font: 'Arial' })],
        spacing: { before: 360, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'D1FAE5' } },
    });

    const kpiRow = (label, value) => new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: String(label), bold: true, size: 20, color: DKGREY })] })],
                borders: { top: NONE, bottom: ROW_LINE, left: NONE, right: NONE },
                shading: { type: ShadingType.SOLID, color: LTGREY },
                width: { size: 60, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
            }),
            new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(value), bold: true, size: 22, color: GREEN })] })],
                borders: { top: NONE, bottom: ROW_LINE, left: NONE, right: NONE },
                shading: { type: ShadingType.SOLID, color: LTGREY },
                width: { size: 40, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
            }),
        ],
    });

    const kpiTable = (rows) => new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideH: NONE, insideV: NONE },
    });

    // ── Build children for main section ──
    const mainChildren = [];

    SECTIONS.forEach((sec, idx) => {
        mainChildren.push(heading1(sec));

        const rawText = sectionTexts[sec] || fallbackSection(sec, d, metrics);
        rawText.split('\n').forEach(line => {
            if (line.trim().length > 0) {
                mainChildren.push(para(line.trim()));
            }
        });

        // Insert bar chart after "Emission Analysis" section (section 8, same as Python)
        if (sec.includes('Emission Analysis') && chartBuf) {
            mainChildren.push(new Paragraph({
                children: [new ImageRun({ type: 'png', data: chartBuf, transformation: { width: 480, height: 300 } })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 160, after: 80 },
            }));
            mainChildren.push(para('Fig 1 – Emission Distribution Matrix (Scope 1, 2, 3)', { align: AlignmentType.CENTER, italic: true, size: 20, color: '64748B', after: 240 }));
        }

        mainChildren.push(new Paragraph({ children: [new PageBreak()] }));
    });

    // ── Environmental Metrics Table (same as Python table) ──
    mainChildren.push(heading1('Environmental Metrics'));
    mainChildren.push(kpiTable([
        kpiRow('Metric', 'Value'),
        kpiRow('Scope 1 — Direct Emissions',         `${metrics.scope1} tCO₂e`),
        kpiRow('Scope 2 — Electricity Emissions',    `${metrics.scope2} tCO₂e`),
        kpiRow('Scope 3 — Value Chain Emissions',    `${metrics.scope3} tCO₂e`),
        kpiRow('Total Emissions',                    `${metrics.total} tCO₂e`),
        kpiRow('Carbon Intensity',                   `${metrics.carbon_intensity} tCO₂e/USD`),
        kpiRow('Recycle Rate',                       `${(metrics.recycle_rate * 100).toFixed(1)}%`),
        kpiRow('Female Workforce %',                 `${(metrics.female_ratio * 100).toFixed(1)}%`),
        kpiRow('Board Diversity %',                  `${(metrics.board_diversity * 100).toFixed(1)}%`),
    ]));

    const doc = new Document({
        sections: [
            // ── Cover page ──
            {
                children: [
                    new Paragraph({ children: [new TextRun({ text: '', break: 5 })] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: d.company, bold: true, size: 72, color: GREEN, font: 'Arial' })],
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Comprehensive Carbon Audit & ESG Sustainability Report 2025', bold: true, size: 30, color: DKGREY })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `${d.industry}  ·  ${reportDate}`, size: 24, color: MIDGREY })],
                        spacing: { after: 80 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Prepared and verified by EcoChain AI Platform', size: 20, italics: true, color: '94A3B8' })],
                    }),
                ],
            },
            // ── Main report with header/footer ──
            {
                properties: {
                    page: {
                        margin: {
                            top:    convertInchesToTwip(1.0),
                            bottom: convertInchesToTwip(1.0),
                            left:   convertInchesToTwip(1.25),
                            right:  convertInchesToTwip(1.25),
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: `${d.company}  ·  ESG Carbon Audit Report ${now.getFullYear()}`, size: 18, color: '94A3B8', italics: true })],
                        })],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: 'Page ', size: 18, color: '94A3B8' }),
                                new PageNumberElement(),
                                new TextRun({ text: '   ·   EcoChain Verified ESG Report   ·   Confidential', size: 18, color: '94A3B8' }),
                            ],
                        })],
                    }),
                },
                children: mainChildren,
            },
        ],
    });

    return Packer.toBuffer(doc);
}

// ─── 5. ROUTES ──────────────────────────────────────────────────────────────────
router.use(verifyToken);

// GET /api/reports/past
router.get('/past', async (req, res, next) => {
    try {
        const reports = await ESGReport
            .find({ company: req.user.company, status: 'completed' })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (err) { next(err); }
});

// POST /api/reports/generate  ←  primary endpoint used by frontend
router.post('/generate', async (req, res) => {
    try {
        const d = req.body;

        // Validation
        const required = [
            'company','industry','revenue',
            'diesel','petrol','coal','electricity',
            'transport_distance','cargo_weight',
            'waste_generated','waste_recycled',
            'employees','female_employees','board_members','female_directors',
        ];
        for (const k of required) {
            if (d[k] === undefined || d[k] === null || d[k] === '') {
                return res.status(400).json({ success: false, message: `Missing required field: ${k}` });
            }
        }

        // 1. Calculate
        const metrics = calculateEmissions(d);

        // 2. Generate chart
        const chartBuf = await generateBarChart(metrics.scope1, metrics.scope2, metrics.scope3);

        // 3. Generate all 18 sections in parallel (same as Python ThreadPoolExecutor)
        const apiKey = process.env.OPENROUTER_API_KEY || '';
        const sectionPromises = SECTIONS.map(sec =>
            generateSectionAI(sec, d, metrics, apiKey).then(text => ({ sec, text }))
        );
        const results    = await Promise.all(sectionPromises);
        const sectionTexts = {};
        results.forEach(({ sec, text }) => { sectionTexts[sec] = text; });

        // 4. Build DOCX
        const buffer = await buildReport(d, metrics, sectionTexts, chartBuf);

        const safeName = d.company.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '_');
        const filename = `${safeName}_ESG_Report_${Date.now()}.docx`;
        const sizeMB   = (buffer.length / (1024 * 1024)).toFixed(2);

        // 5. Upload to Cloudinary
        let cloudinaryUrl = '';
        try {
            cloudinaryUrl = await cloudinaryUtil.uploadFile(
                buffer, filename,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
        } catch (upErr) {
            console.error('[ESG] Cloudinary upload failed:', upErr.message);
        }

        // 6. Save to MongoDB
        try {
            await ESGReport.create({
                company: req.user.company,
                jobId:   `sync_${Date.now()}`,
                name:    `${d.company} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
                type:    'ESG',
                size:    `${sizeMB} MB`,
                url:     cloudinaryUrl,
                status:  'completed',
            });
        } catch (dbErr) {
            console.error('[ESG] DB save failed:', dbErr.message);
        }

        // 7. Respond
        if (cloudinaryUrl) {
            return res.json({ success: true, cloudinaryUrl, downloadUrl: cloudinaryUrl });
        }

        // Base64 fallback so browser can still download even if Cloudinary is not configured
        const dataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`;
        return res.json({ success: true, cloudinaryUrl: '', downloadUrl: dataUri });

    } catch (err) {
        console.error('[ESG] Report generation error:', err.message, err.stack);
        res.status(500).json({ success: false, message: 'Report generation failed', detail: err.message });
    }
});

// POST /api/reports/generate-async  ←  delegates to sync (Python no longer needed)
router.post('/generate-async', (req, res, next) => {
    req.url = '/generate';
    router.handle(req, res, next);
});

// GET /api/reports/status/:jobId  ←  kept for backwards compat, reads from DB
router.get('/status/:jobId', async (req, res) => {
    try {
        const report = await ESGReport.findOne({ jobId: req.params.jobId });
        if (!report) return res.status(404).json({ status: 'not_found' });
        res.json({ status: report.status, cloudinaryUrl: report.url || '', report: report.name });
    } catch (err) {
        res.status(500).json({ error: 'Status fetch failed', detail: err.message });
    }
});

module.exports = router;
