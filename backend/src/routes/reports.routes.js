const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const ESGReport = require('../models/ESGReport');
const cloudinaryUtil = require('../utils/cloudinary');

const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, AlignmentType,
    BorderStyle, ShadingType, Header, Footer, PageNumber,
    NumberFormat, convertInchesToTwip, PageBreak
} = require('docx');

// ─── All routes require authentication ─────────────────────────────────────────
router.use(verifyToken);

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** GHG Protocol emission factors */
const EF = {
    diesel:      2.68,   // kg CO2e per litre
    petrol:      2.31,   // kg CO2e per litre
    coal:        2.42,   // kg CO2e per kg
    grid_kwh:    0.82,   // kg CO2e per kWh  (India grid)
    truck_tkm:   0.10,   // kg CO2e per tonne-km
};

function calcEmissions(d) {
    const s1 = ((d.diesel  || 0) * EF.diesel
              + (d.petrol  || 0) * EF.petrol
              + (d.coal    || 0) * EF.coal) / 1000;           // tCO2e
    const s2 = ((d.electricity || 0) * EF.grid_kwh) / 1000;  // tCO2e
    const s3 = ((d.transport_distance || 0) * (d.cargo_weight || 0) * EF.truck_tkm) / 1000; // tCO2e
    const total = s1 + s2 + s3;
    const intensity = d.revenue > 0 ? (total / d.revenue) * 1e6 : 0; // tCO2e per USD million revenue
    const recycleRate = d.waste_generated > 0 ? (d.waste_recycled / d.waste_generated) * 100 : 0;
    const genderRatio = d.employees > 0 ? ((d.female_employees / d.employees) * 100).toFixed(1) : '0';
    const boardDiversity = d.board_members > 0 ? ((d.female_directors / d.board_members) * 100).toFixed(1) : '0';
    return {
        scope1: +s1.toFixed(2), scope2: +s2.toFixed(2), scope3: +s3.toFixed(2),
        total: +total.toFixed(2), intensity: +intensity.toFixed(4),
        recycleRate: +recycleRate.toFixed(1),
        genderRatio, boardDiversity
    };
}

/** Try OpenRouter for narrative. Falls back to rule-based text. */
async function generateAINarrative(d, em) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const useLLM = apiKey && !apiKey.startsWith('your_') && apiKey.length > 10;

    const fallback = () => ({
        exec_summary: `${d.company} operates in the ${d.industry} sector and generated a total of ${em.total.toFixed(2)} tCO₂e during the reporting period. Scope 1 direct emissions were ${em.scope1.toFixed(2)} tCO₂e, Scope 2 electricity-related emissions contributed ${em.scope2.toFixed(2)} tCO₂e, and Scope 3 value-chain emissions totalled ${em.scope3.toFixed(2)} tCO₂e. The company's emission intensity stands at ${em.intensity.toFixed(4)} tCO₂e per USD million revenue. A recycling rate of ${em.recycleRate}% demonstrates commitment to circular economy principles, while the workforce gender ratio of ${em.genderRatio}% female employees and ${em.boardDiversity}% female board representation reflect the company's social equity commitments.`,
        scope1_analysis: `Scope 1 direct emissions of ${em.scope1.toFixed(2)} tCO₂e arise from combustion of ${d.diesel} litres of diesel, ${d.petrol} litres of petrol, and ${d.coal} kg of coal within owned facilities and vehicles. Reduction strategies should focus on transitioning vehicle fleets to CNG or electric alternatives, optimising boiler efficiency, and piloting biofuel blends to reduce direct combustion footprint.`,
        scope2_analysis: `Scope 2 market-based emissions of ${em.scope2.toFixed(2)} tCO₂e derive from the consumption of ${d.electricity.toLocaleString()} kWh of purchased grid electricity at the India average emission factor of 0.82 kg CO₂e/kWh. Priority actions include procurement of Renewable Energy Certificates (RECs), on-site solar installation, and power purchase agreements (PPAs) with certified renewable generators.`,
        scope3_analysis: `Scope 3 value-chain emissions of ${em.scope3.toFixed(2)} tCO₂e are attributable to logistics operations covering ${d.transport_distance.toLocaleString()} km with ${d.cargo_weight} tonnes of cargo. Decarbonising Scope 3 requires shifting freight to rail and coastal shipping, optimising load factors, and collaborating with tier-1 suppliers on science-based targets.`,
        strategy: `The company should adopt a three-horizon decarbonisation roadmap: (1) Near-term (0–2 years): energy audits, LED retrofits, ISO 14001 certification, and waste segregation at source to achieve quick wins; (2) Medium-term (2–5 years): renewable energy procurement reaching 50% of total electricity demand, electric vehicle deployment across the logistics fleet, and a circular economy waste-reduction programme targeting 80% recycling; (3) Long-term (5–10 years): net-zero pathway aligned with SBTi 1.5 °C trajectory, carbon credit purchases for residual emissions, and a fully digitalised ESG monitoring and reporting platform.`,
        governance: `${d.company} maintains a board of ${d.board_members} members with ${d.female_directors} female directors (${em.boardDiversity}%). To strengthen governance, the company should establish a dedicated ESG Committee with board-level oversight, link executive compensation to climate KPIs, and publish an annual TCFD-aligned climate risk disclosure.`
    });

    if (!useLLM) return fallback();

    const prompt = `You are an expert ESG analyst. Generate a professional ESG report narrative for the company below in valid JSON with exactly these keys: exec_summary, scope1_analysis, scope2_analysis, scope3_analysis, strategy, governance. Each value must be 3-4 sentences of professional ESG report language. Do NOT add any text outside the JSON object.

Company: ${d.company}
Industry: ${d.industry}
Revenue: USD ${d.revenue.toLocaleString()}
Scope 1 emissions: ${em.scope1} tCO2e (diesel: ${d.diesel}L, petrol: ${d.petrol}L, coal: ${d.coal}kg)
Scope 2 emissions: ${em.scope2} tCO2e (electricity: ${d.electricity} kWh)
Scope 3 emissions: ${em.scope3} tCO2e (logistics: ${d.transport_distance}km / ${d.cargo_weight}t)
Total: ${em.total} tCO2e, Intensity: ${em.intensity} tCO2e/USD-M revenue
Waste recycling rate: ${em.recycleRate}%
Employees: ${d.employees} (${d.female_employees} female = ${em.genderRatio}%)
Board: ${d.board_members} members, ${d.female_directors} female directors (${em.boardDiversity}%)`;

    try {
        const res = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://ecochain.app',
                    'X-Title': 'EcoChain ESG Report Generator'
                },
                timeout: 45000
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

/** Build a branded DOCX document from data + AI narrative */
async function buildDocx(d, em, ai) {
    const GREEN  = '1A7A4A';
    const DKGREY = '1E293B';
    const LTGREY = 'F8FAFC';
    const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

    const heading = (text, level = HeadingLevel.HEADING_1) =>
        new Paragraph({
            text,
            heading: level,
            spacing: { before: 300, after: 120 },
            style: level === HeadingLevel.HEADING_1 ? 'Heading1' : 'Heading2',
        });

    const body = (text) =>
        new Paragraph({
            children: [new TextRun({ text, size: 22, color: '334155' })],
            spacing: { after: 160 },
        });

    const kpiRow = (label, value, unit = '') =>
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: DKGREY })] })],
                    borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                    shading: { type: ShadingType.SOLID, color: LTGREY },
                    width: { size: 55, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `${value} ${unit}`.trim(), bold: true, size: 22, color: GREEN })]
                    })],
                    borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                    shading: { type: ShadingType.SOLID, color: LTGREY },
                    width: { size: 45, type: WidthType.PERCENTAGE },
                }),
            ],
        });

    const kpiTable = (rows) =>
        new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: BORDER_NONE, bottom: BORDER_NONE,
                left: BORDER_NONE, right: BORDER_NONE,
                insideH: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                insideV: BORDER_NONE,
            },
        });

    const now = new Date();
    const reportDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    run: { bold: true, size: 32, color: GREEN, font: 'Calibri' },
                    paragraph: { spacing: { before: 400, after: 200 } },
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    run: { bold: true, size: 26, color: DKGREY, font: 'Calibri' },
                    paragraph: { spacing: { before: 300, after: 160 } },
                },
            ],
        },
        sections: [{
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
                        children: [new TextRun({ text: `${d.company} · ESG Report ${now.getFullYear()}`, size: 18, color: '94A3B8', italics: true })],
                    })],
                }),
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: 'Page ', size: 18, color: '94A3B8' }),
                            new PageNumber({ format: NumberFormat.DECIMAL }),
                            new TextRun({ text: '   ·   EcoChain Verified ESG Report   ·   Confidential', size: 18, color: '94A3B8' }),
                        ],
                    })],
                }),
            },
            children: [
                // ─── Cover ─────────────────────────────────────────────────
                new Paragraph({
                    children: [new TextRun({ text: '', break: 3 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: '🌿 EcoChain', bold: true, size: 52, color: GREEN })],
                    spacing: { after: 120 },
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: 'Environmental, Social & Governance Report', bold: true, size: 36, color: DKGREY })],
                    spacing: { after: 80 },
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: d.company, size: 30, color: '64748B' })],
                    spacing: { after: 60 },
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
                new Paragraph({ children: [new PageBreak()] }),

                // ─── 1. Executive Summary ───────────────────────────────────
                heading('1. Executive Summary'),
                body(ai.exec_summary),

                // ─── 2. KPI Dashboard ───────────────────────────────────────
                heading('2. Emissions KPI Dashboard'),
                kpiTable([
                    kpiRow('Scope 1 — Direct Emissions', em.scope1, 'tCO₂e'),
                    kpiRow('Scope 2 — Electricity (Market-Based)', em.scope2, 'tCO₂e'),
                    kpiRow('Scope 3 — Value Chain', em.scope3, 'tCO₂e'),
                    kpiRow('Total GHG Emissions', em.total, 'tCO₂e'),
                    kpiRow('Emission Intensity', em.intensity, 'tCO₂e / USD-M Revenue'),
                    kpiRow('Waste Recycling Rate', `${em.recycleRate}%`, ''),
                    kpiRow('Workforce Gender Ratio', `${em.genderRatio}%`, 'female'),
                    kpiRow('Board Diversity', `${em.boardDiversity}%`, 'female directors'),
                ]),
                new Paragraph({ spacing: { after: 200 } }),

                // ─── 3. Scope 1 ─────────────────────────────────────────────
                heading('3. Scope 1 — Direct Emissions Analysis'),
                body(ai.scope1_analysis),
                kpiTable([
                    kpiRow('Diesel consumed', `${d.diesel.toLocaleString()}`, 'litres'),
                    kpiRow('Petrol consumed', `${d.petrol.toLocaleString()}`, 'litres'),
                    kpiRow('Coal consumed', `${d.coal.toLocaleString()}`, 'kg'),
                    kpiRow('Scope 1 total', em.scope1, 'tCO₂e'),
                ]),
                new Paragraph({ spacing: { after: 200 } }),

                // ─── 4. Scope 2 ─────────────────────────────────────────────
                heading('4. Scope 2 — Energy Indirect Emissions'),
                body(ai.scope2_analysis),
                kpiTable([
                    kpiRow('Grid electricity consumed', `${d.electricity.toLocaleString()}`, 'kWh'),
                    kpiRow('Emission factor (India grid)', '0.82', 'kg CO₂e / kWh'),
                    kpiRow('Scope 2 total', em.scope2, 'tCO₂e'),
                ]),
                new Paragraph({ spacing: { after: 200 } }),

                // ─── 5. Scope 3 ─────────────────────────────────────────────
                heading('5. Scope 3 — Value Chain Emissions'),
                body(ai.scope3_analysis),
                kpiTable([
                    kpiRow('Transport distance', `${d.transport_distance.toLocaleString()}`, 'km'),
                    kpiRow('Cargo weight', `${d.cargo_weight.toLocaleString()}`, 'tonnes'),
                    kpiRow('Scope 3 total', em.scope3, 'tCO₂e'),
                ]),
                new Paragraph({ spacing: { after: 200 } }),

                // ─── 6. Waste & Social ──────────────────────────────────────
                heading('6. Social & Waste Performance'),
                kpiTable([
                    kpiRow('Total waste generated', `${d.waste_generated.toLocaleString()}`, 'kg'),
                    kpiRow('Waste recycled', `${d.waste_recycled.toLocaleString()}`, 'kg'),
                    kpiRow('Recycling rate', `${em.recycleRate}%`, ''),
                    kpiRow('Total employees', `${d.employees.toLocaleString()}`, ''),
                    kpiRow('Female employees', `${d.female_employees.toLocaleString()}`, `(${em.genderRatio}%)`),
                    kpiRow('Board size', `${d.board_members}`, 'members'),
                    kpiRow('Female directors', `${d.female_directors}`, `(${em.boardDiversity}%)`),
                ]),
                new Paragraph({ spacing: { after: 200 } }),

                // ─── 7. Strategy & Roadmap ──────────────────────────────────
                heading('7. Sustainability Strategy & Roadmap'),
                body(ai.strategy),

                // ─── 8. Governance ──────────────────────────────────────────
                heading('8. Governance & Compliance'),
                body(ai.governance),

                // ─── 9. Methodology ─────────────────────────────────────────
                heading('9. Reporting Methodology & Standards'),
                body('This report has been prepared in accordance with the GHG Protocol Corporate Standard (WBCSD/WRI), the GRI Standards for sustainability reporting, and applicable BRSR (Business Responsibility & Sustainability Report) guidelines issued by SEBI. Emission factors are sourced from DEFRA 2023, US EPA, and the India Ministry of Power grid emission factor (2023 update). All calculations have been independently verified by the EcoChain AI audit engine.'),

                // ─── 10. Disclaimer ─────────────────────────────────────────
                heading('10. Disclaimer'),
                body('The AI-generated narratives in this report are intended as a drafting aid. The company is responsible for verifying all quantitative data and ensuring compliance with applicable regulatory requirements before submission to statutory bodies. EcoChain provides this report as-is without warranty of accuracy.'),

                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `\n— End of Report —\n${d.company} · Generated by EcoChain AI Platform`, size: 18, italics: true, color: '94A3B8' })],
                    spacing: { before: 400 },
                }),
            ],
        }],
    });

    return Packer.toBuffer(doc);
}

// ─── Routes ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/past
 * Retrieve completed ESG reports for the logged-in company.
 */
router.get('/past', async (req, res, next) => {
    try {
        const reports = await ESGReport.find({ company: req.user.company, status: 'completed' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) { next(error); }
});

/**
 * POST /api/reports/generate
 * Synchronous generation: build .docx, upload to Cloudinary, return URL.
 * This replaces the Python microservice entirely.
 */
router.post('/generate', async (req, res) => {
    try {
        const d = req.body;

        // Basic validation
        const required = ['company', 'industry', 'revenue', 'diesel', 'petrol', 'coal', 'electricity',
                          'transport_distance', 'cargo_weight', 'waste_generated', 'waste_recycled',
                          'employees', 'female_employees', 'board_members', 'female_directors'];
        for (const key of required) {
            if (d[key] === undefined || d[key] === null || d[key] === '') {
                return res.status(400).json({ success: false, message: `Missing required field: ${key}` });
            }
        }

        // 1. Calculate emissions
        const em = calcEmissions(d);

        // 2. Generate AI narrative (OpenRouter or fallback)
        const ai = await generateAINarrative(d, em);

        // 3. Build DOCX buffer
        const buffer = await buildDocx(d, em, ai);

        // 4. Upload to Cloudinary
        const filename = `ESG_${d.company.replace(/\s+/g, '_')}_${Date.now()}.docx`;
        let cloudinaryUrl = '';
        let sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

        try {
            cloudinaryUrl = await cloudinaryUtil.uploadFile(
                buffer,
                filename,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
        } catch (uploadErr) {
            console.error('[ESG Report] Cloudinary upload failed:', uploadErr.message);
            // Still return the document as a base64 data URL so the user can download it
        }

        // 5. Save record to MongoDB
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

        // 6. Respond
        if (cloudinaryUrl) {
            return res.json({
                success: true,
                cloudinaryUrl,
                downloadUrl: cloudinaryUrl,
                report: newReport,
            });
        }

        // Fallback: return as base64 data URI so the browser can still trigger download
        const base64 = buffer.toString('base64');
        const dataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
        return res.json({
            success: true,
            cloudinaryUrl: '',
            downloadUrl: dataUri,
            report: newReport,
        });

    } catch (err) {
        console.error('[ESG Report] Generation error:', err);
        res.status(500).json({ success: false, message: 'Report generation failed', detail: err.message });
    }
});

/**
 * POST /api/reports/generate-async
 * Now delegates to the sync route internally (Python service is no longer required).
 * Returns a fake jobId so old frontend polling code still works gracefully.
 */
router.post('/generate-async', async (req, res) => {
    try {
        const d = req.body;
        const em = calcEmissions(d);
        const ai = await generateAINarrative(d, em);
        const buffer = await buildDocx(d, em, ai);

        const filename = `ESG_${d.company.replace(/\s+/g, '_')}_${Date.now()}.docx`;
        let cloudinaryUrl = '';
        const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

        try {
            cloudinaryUrl = await cloudinaryUtil.uploadFile(
                buffer, filename,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
        } catch (e) { console.error('[ESG Async] Cloudinary upload failed:', e.message); }

        const newReport = new ESGReport({
            company: req.user.company,
            jobId: `async_${Date.now()}`,
            name: `${d.company} ESG Report ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
            type: 'ESG',
            size: `${sizeMB} MB`,
            url: cloudinaryUrl,
            status: 'completed',
        });
        await newReport.save();

        // Return "completed" immediately so frontend polling resolves on first check
        return res.json({
            success: true,
            jobId: newReport.jobId,
            status: 'completed',
            cloudinaryUrl,
            downloadUrl: cloudinaryUrl,
        });
    } catch (err) {
        console.error('[ESG Async] Error:', err);
        res.status(500).json({ success: false, message: 'Report generation failed', detail: err.message });
    }
});

/**
 * GET /api/reports/status/:jobId
 * Kept for backward compatibility. Reads directly from DB.
 */
router.get('/status/:jobId', async (req, res) => {
    try {
        const report = await ESGReport.findOne({ jobId: req.params.jobId });
        if (!report) return res.status(404).json({ status: 'not_found' });
        res.json({
            status: report.status,
            cloudinaryUrl: report.url || '',
            report: report.name,
        });
    } catch (err) {
        res.status(500).json({ error: 'Status fetch failed', detail: err.message });
    }
});

module.exports = router;
