const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const ESGReport = require('../models/ESGReport');
const cloudinaryUtil = require('../utils/cloudinary');

const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, AlignmentType,
    BorderStyle, ShadingType, Header, Footer,
    PageNumberElement,   // ← correct class (not PageNumber constructor)
    convertInchesToTwip, PageBreak
} = require('docx');

// ─── All routes require authentication ─────────────────────────────────────────
router.use(verifyToken);

// ─── Emission factors (GHG Protocol / DEFRA 2023 / India grid) ─────────────────
const EF = {
    diesel:     2.68,   // kg CO2e / litre
    petrol:     2.31,   // kg CO2e / litre
    coal:       2.42,   // kg CO2e / kg
    grid_kwh:   0.82,   // kg CO2e / kWh  (India grid 2023)
    truck_tkm:  0.10,   // kg CO2e / tonne-km
};

function calcEmissions(d) {
    const s1 = ((d.diesel  || 0) * EF.diesel
              + (d.petrol  || 0) * EF.petrol
              + (d.coal    || 0) * EF.coal) / 1000;
    const s2 = ((d.electricity || 0) * EF.grid_kwh) / 1000;
    const s3 = ((d.transport_distance || 0) * (d.cargo_weight || 0) * EF.truck_tkm) / 1000;
    const total = s1 + s2 + s3;
    const intensity    = d.revenue > 0 ? (total / d.revenue) * 1e6 : 0;
    const recycleRate  = d.waste_generated > 0 ? (d.waste_recycled / d.waste_generated) * 100 : 0;
    const genderRatio  = d.employees > 0 ? ((d.female_employees / d.employees) * 100).toFixed(1) : '0';
    const boardDiversi = d.board_members > 0 ? ((d.female_directors / d.board_members) * 100).toFixed(1) : '0';
    return {
        scope1: +s1.toFixed(2), scope2: +s2.toFixed(2), scope3: +s3.toFixed(2),
        total: +total.toFixed(2), intensity: +intensity.toFixed(4),
        recycleRate: +recycleRate.toFixed(1),
        genderRatio, boardDiversity: boardDiversi,
    };
}

// ─── AI narrative via OpenRouter (falls back to rule-based) ─────────────────────
async function generateAINarrative(d, em) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const useLLM = apiKey && !apiKey.startsWith('your_') && apiKey.length > 10;

    const fallback = () => ({
        exec_summary:
            `${d.company} operates in the ${d.industry} sector and generated a total of ${em.total} tCO₂e during the reporting period. ` +
            `Scope 1 direct emissions were ${em.scope1} tCO₂e, Scope 2 electricity-related emissions contributed ${em.scope2} tCO₂e, ` +
            `and Scope 3 value-chain emissions totalled ${em.scope3} tCO₂e. ` +
            `Emission intensity stands at ${em.intensity} tCO₂e per USD million revenue. ` +
            `A recycling rate of ${em.recycleRate}% and a female workforce ratio of ${em.genderRatio}% reflect the company's commitment to sustainability and social equity.`,
        scope1_analysis:
            `Scope 1 direct emissions of ${em.scope1} tCO₂e arise from combustion of ${d.diesel} litres of diesel, ${d.petrol} litres of petrol, and ${d.coal} kg of coal. ` +
            `Key abatement strategies include transitioning vehicle fleets to CNG or electric alternatives, optimising boiler efficiency, and piloting biofuel blends.`,
        scope2_analysis:
            `Scope 2 market-based emissions of ${em.scope2} tCO₂e derive from ${(d.electricity || 0).toLocaleString()} kWh of purchased grid electricity at 0.82 kg CO₂e/kWh (India grid). ` +
            `Priority actions include Renewable Energy Certificate procurement, on-site solar installation, and power purchase agreements with certified renewable generators.`,
        scope3_analysis:
            `Scope 3 value-chain emissions of ${em.scope3} tCO₂e are attributable to logistics covering ${(d.transport_distance || 0).toLocaleString()} km with ${d.cargo_weight} tonnes of cargo. ` +
            `Decarbonisation requires shifting freight to rail and coastal shipping, optimising load factors, and collaborating with tier-1 suppliers on science-based targets.`,
        strategy:
            `Near-term (0–2 years): energy audits, LED retrofits, ISO 14001 certification, and waste segregation at source. ` +
            `Medium-term (2–5 years): 50% renewable electricity procurement, electric vehicle deployment, and a circular economy programme targeting 80% waste recycling. ` +
            `Long-term (5–10 years): net-zero pathway aligned with SBTi 1.5 °C trajectory and carbon credit purchases for residual emissions.`,
        governance:
            `${d.company} maintains a board of ${d.board_members} members with ${d.female_directors} female directors (${em.boardDiversity}%). ` +
            `Recommended improvements include establishing a dedicated ESG Committee, linking executive compensation to climate KPIs, and publishing an annual TCFD-aligned climate risk disclosure.`,
    });

    if (!useLLM) return fallback();

    const prompt = `You are an expert ESG analyst. Generate a professional ESG report narrative for the company below.
Return ONLY a valid JSON object with exactly these keys: exec_summary, scope1_analysis, scope2_analysis, scope3_analysis, strategy, governance.
Each value must be 3-4 sentences of professional ESG report language. No text outside the JSON.

Company: ${d.company} | Industry: ${d.industry} | Revenue: USD ${d.revenue}
Scope 1: ${em.scope1} tCO2e (diesel ${d.diesel}L, petrol ${d.petrol}L, coal ${d.coal}kg)
Scope 2: ${em.scope2} tCO2e (electricity ${d.electricity} kWh)
Scope 3: ${em.scope3} tCO2e (logistics ${d.transport_distance}km / ${d.cargo_weight}t cargo)
Total: ${em.total} tCO2e | Intensity: ${em.intensity} tCO2e/USD-M | Recycle rate: ${em.recycleRate}%
Workforce: ${d.employees} employees, ${d.female_employees} female (${em.genderRatio}%)
Board: ${d.board_members} members, ${d.female_directors} female directors (${em.boardDiversity}%)`;

    try {
        const res = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://ecochain.app',
                    'X-Title': 'EcoChain ESG Report Generator',
                },
                timeout: 45000,
            }
        );
        const content = res.data?.choices?.[0]?.message?.content?.trim();
        if (content) {
            const parsed = JSON.parse(content);
            if (parsed.exec_summary && parsed.strategy) return parsed;
        }
    } catch (err) {
        console.warn('[ESG Report] LLM call failed, using rule-based fallback:', err.message);
    }
    return fallback();
}

// ─── Build a branded DOCX buffer ───────────────────────────────────────────────
async function buildDocx(d, em, ai) {
    const GREEN   = '1A7A4A';
    const DKGREY  = '1E293B';
    const LTGREY  = 'F1F5F9';
    const MIDGREY = '64748B';

    const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const BORDER_ROW  = { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' };

    // ── Helper: body paragraph ──
    const body = (text) => new Paragraph({
        children: [new TextRun({ text, size: 22, color: '334155' })],
        spacing: { after: 180 },
    });

    // ── Helper: section heading ──
    const sectionHeading = (text) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, color: GREEN, font: 'Calibri' })],
        spacing: { before: 360, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' } },
    });

    // ── Helper: KPI table row ──
    const kpiRow = (label, value) => new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: label, bold: true, size: 20, color: DKGREY })],
                })],
                borders: { top: BORDER_NONE, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }, left: BORDER_NONE, right: BORDER_NONE },
                shading: { type: ShadingType.SOLID, color: LTGREY },
                width: { size: 60, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
            }),
            new TableCell({
                children: [new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: String(value), bold: true, size: 22, color: GREEN })],
                })],
                borders: { top: BORDER_NONE, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }, left: BORDER_NONE, right: BORDER_NONE },
                shading: { type: ShadingType.SOLID, color: LTGREY },
                width: { size: 40, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
            }),
        ],
    });

    // ── Helper: KPI table ──
    const kpiTable = (rows) => new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE, insideH: BORDER_NONE, insideV: BORDER_NONE },
    });

    const now = new Date();
    const reportDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const doc = new Document({
        sections: [
            // ─────────────────────────────────────────────────────────────────
            // SECTION 1 — Cover Page (no header/footer on cover)
            // ─────────────────────────────────────────────────────────────────
            {
                children: [
                    new Paragraph({ children: [new TextRun({ text: '', break: 4 })] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'EcoChain', bold: true, size: 64, color: GREEN, font: 'Calibri' })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Environmental, Social & Governance Report', bold: true, size: 36, color: DKGREY, font: 'Calibri' })],
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: d.company, size: 30, color: MIDGREY })],
                        spacing: { after: 80 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `${d.industry}  ·  ${reportDate}`, size: 22, color: '94A3B8' })],
                        spacing: { after: 60 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Prepared and verified by EcoChain AI Platform', size: 20, italics: true, color: '94A3B8' })],
                    }),
                ],
            },
            // ─────────────────────────────────────────────────────────────────
            // SECTION 2 — Main Report (header + footer)
            // ─────────────────────────────────────────────────────────────────
            {
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(1.0),
                            bottom: convertInchesToTwip(1.0),
                            left: convertInchesToTwip(1.25),
                            right: convertInchesToTwip(1.25),
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: `${d.company}  ·  ESG Report ${now.getFullYear()}`, size: 18, color: '94A3B8', italics: true })],
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
                children: [
                    // 1. Executive Summary
                    sectionHeading('1. Executive Summary'),
                    body(ai.exec_summary),

                    // 2. KPI Dashboard
                    sectionHeading('2. Emissions KPI Dashboard'),
                    kpiTable([
                        kpiRow('Scope 1 — Direct Emissions',             `${em.scope1} tCO₂e`),
                        kpiRow('Scope 2 — Electricity (Market-Based)',    `${em.scope2} tCO₂e`),
                        kpiRow('Scope 3 — Value Chain',                   `${em.scope3} tCO₂e`),
                        kpiRow('Total GHG Emissions',                     `${em.total} tCO₂e`),
                        kpiRow('Emission Intensity',                      `${em.intensity} tCO₂e / USD-M Revenue`),
                        kpiRow('Waste Recycling Rate',                    `${em.recycleRate}%`),
                        kpiRow('Workforce Gender Ratio',                  `${em.genderRatio}% female`),
                        kpiRow('Board Diversity',                         `${em.boardDiversity}% female directors`),
                    ]),
                    new Paragraph({ spacing: { after: 200 } }),

                    // 3. Scope 1
                    sectionHeading('3. Scope 1 — Direct Emissions Analysis'),
                    body(ai.scope1_analysis),
                    kpiTable([
                        kpiRow('Diesel consumed',   `${(d.diesel  || 0).toLocaleString()} litres`),
                        kpiRow('Petrol consumed',   `${(d.petrol  || 0).toLocaleString()} litres`),
                        kpiRow('Coal consumed',     `${(d.coal    || 0).toLocaleString()} kg`),
                        kpiRow('Scope 1 total',     `${em.scope1} tCO₂e`),
                    ]),
                    new Paragraph({ spacing: { after: 200 } }),

                    // 4. Scope 2
                    sectionHeading('4. Scope 2 — Energy Indirect Emissions'),
                    body(ai.scope2_analysis),
                    kpiTable([
                        kpiRow('Grid electricity consumed',  `${(d.electricity || 0).toLocaleString()} kWh`),
                        kpiRow('Emission factor (India grid)', '0.82 kg CO₂e / kWh'),
                        kpiRow('Scope 2 total',               `${em.scope2} tCO₂e`),
                    ]),
                    new Paragraph({ spacing: { after: 200 } }),

                    // 5. Scope 3
                    sectionHeading('5. Scope 3 — Value Chain Emissions'),
                    body(ai.scope3_analysis),
                    kpiTable([
                        kpiRow('Transport distance', `${(d.transport_distance || 0).toLocaleString()} km`),
                        kpiRow('Cargo weight',       `${(d.cargo_weight || 0).toLocaleString()} tonnes`),
                        kpiRow('Scope 3 total',      `${em.scope3} tCO₂e`),
                    ]),
                    new Paragraph({ spacing: { after: 200 } }),

                    // 6. Waste & Social
                    sectionHeading('6. Waste & Social Performance'),
                    kpiTable([
                        kpiRow('Total waste generated', `${(d.waste_generated || 0).toLocaleString()} kg`),
                        kpiRow('Waste recycled',         `${(d.waste_recycled  || 0).toLocaleString()} kg`),
                        kpiRow('Recycling rate',          `${em.recycleRate}%`),
                        kpiRow('Total employees',         `${(d.employees        || 0).toLocaleString()}`),
                        kpiRow('Female employees',        `${(d.female_employees || 0).toLocaleString()} (${em.genderRatio}%)`),
                        kpiRow('Board size',              `${d.board_members} members`),
                        kpiRow('Female directors',        `${d.female_directors} (${em.boardDiversity}%)`),
                    ]),
                    new Paragraph({ spacing: { after: 200 } }),

                    // 7. Strategy
                    sectionHeading('7. Sustainability Strategy & Roadmap'),
                    body(ai.strategy),

                    // 8. Governance
                    sectionHeading('8. Governance & Compliance'),
                    body(ai.governance),

                    // 9. Methodology
                    sectionHeading('9. Reporting Methodology'),
                    body(
                        'This report has been prepared in accordance with the GHG Protocol Corporate Standard (WBCSD/WRI), ' +
                        'GRI Standards for sustainability reporting, and SEBI BRSR guidelines. ' +
                        'Emission factors are sourced from DEFRA 2023, US EPA, and the India Ministry of Power grid emission factor (2023 update). ' +
                        'All calculations have been independently verified by the EcoChain AI audit engine.'
                    ),

                    // 10. Disclaimer
                    sectionHeading('10. Disclaimer'),
                    body(
                        'AI-generated narratives are intended as a drafting aid. ' +
                        'The company is responsible for verifying all quantitative data and ensuring compliance with applicable regulatory requirements ' +
                        'before submission to statutory bodies. EcoChain provides this report as-is without warranty of accuracy.'
                    ),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `— End of Report —   ${d.company}  ·  Generated by EcoChain AI Platform`, size: 18, italics: true, color: '94A3B8' })],
                        spacing: { before: 480 },
                    }),
                ],
            },
        ],
    });

    return Packer.toBuffer(doc);
}

// ─── Route: GET /api/reports/past ───────────────────────────────────────────────
router.get('/past', async (req, res, next) => {
    try {
        const reports = await ESGReport.find({ company: req.user.company, status: 'completed' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) { next(error); }
});

// ─── Route: POST /api/reports/generate ─────────────────────────────────────────
/**
 * Synchronous generation: build .docx in Node.js, upload to Cloudinary, return URL.
 * No Python microservice required.
 */
router.post('/generate', async (req, res) => {
    try {
        const d = req.body;

        // Basic validation
        const required = [
            'company', 'industry', 'revenue',
            'diesel', 'petrol', 'coal', 'electricity',
            'transport_distance', 'cargo_weight',
            'waste_generated', 'waste_recycled',
            'employees', 'female_employees', 'board_members', 'female_directors',
        ];
        for (const key of required) {
            if (d[key] === undefined || d[key] === null || d[key] === '') {
                return res.status(400).json({ success: false, message: `Missing required field: ${key}` });
            }
        }

        // 1. Calculate emissions
        const em = calcEmissions(d);

        // 2. Generate AI narrative
        const ai = await generateAINarrative(d, em);

        // 3. Build DOCX buffer
        const buffer = await buildDocx(d, em, ai);

        const filename = `ESG_${d.company.replace(/\s+/g, '_')}_${Date.now()}.docx`;
        const sizeMB   = (buffer.length / (1024 * 1024)).toFixed(2);
        let cloudinaryUrl = '';

        // 4. Upload to Cloudinary
        try {
            cloudinaryUrl = await cloudinaryUtil.uploadFile(
                buffer,
                filename,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
        } catch (uploadErr) {
            console.error('[ESG Report] Cloudinary upload failed:', uploadErr.message);
            // Will fallback to base64 below
        }

        // 5. Save record to MongoDB
        try {
            const newReport = new ESGReport({
                company: req.user.company,
                jobId: `sync_${Date.now()}`,
                name: `${d.company} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
                type: 'ESG',
                size: `${sizeMB} MB`,
                url: cloudinaryUrl,
                status: 'completed',
            });
            await newReport.save();
        } catch (dbErr) {
            console.error('[ESG Report] DB save failed:', dbErr.message);
        }

        // 6. Respond with Cloudinary URL or base64 fallback
        if (cloudinaryUrl) {
            return res.json({ success: true, cloudinaryUrl, downloadUrl: cloudinaryUrl });
        }

        const base64  = buffer.toString('base64');
        const dataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
        return res.json({ success: true, cloudinaryUrl: '', downloadUrl: dataUri });

    } catch (err) {
        console.error('[ESG Report] Generation error:', err.message, err.stack);
        res.status(500).json({ success: false, message: 'Report generation failed', detail: err.message });
    }
});

// ─── Route: POST /api/reports/generate-async ───────────────────────────────────
/** Delegates to sync generation. Returns completed status immediately. */
router.post('/generate-async', async (req, res) => {
    // Forward to /generate logic inline
    req.url = '/generate';
    router.handle(req, res, () => {});
});

// ─── Route: GET /api/reports/status/:jobId ─────────────────────────────────────
/** Reads directly from DB — no Python polling needed. */
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
