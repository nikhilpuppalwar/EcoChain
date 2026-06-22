const EmissionEntry = require('../models/EmissionEntry');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AnomalyReport = require('../models/AnomalyReport');
const ReportReview = require('../models/ReportReview');
const BlockchainEvent = require('../models/BlockchainEvent');
const axios = require('axios');
const pinataUtil = require('../utils/pinata');
const { broadcastToRole } = require('../utils/websocket');
const { calculateCO2e } = require('../utils/co2Calculator');
const { internalTriggerAICheck } = require('./ai.controller'); // Import AI Logic
const { logBlockchainEvent } = require('../utils/ledger');

/* ===========================
 * GET ALL ENTRIES (FOR USER'S COMPANY)
 * =========================== */
exports.getEmissions = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const query = { company: req.user.company };

        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.year) {
            query.periodYear = req.query.year;
        }

        const emissions = await EmissionEntry.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await EmissionEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            data: emissions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CREATE NEW ENTRY
 * =========================== */
exports.createEmission = async (req, res, next) => {
    try {
        const { 
            periodMonth, periodYear, quantityTonnes, emissionSource, notes, location,
            wasteGeneration, logisticsTransport, vehicleEmissions, productionOutput,
            scope1, scope2, scope3, period
        } = req.body;
        
        // Ensure robust backward/forward compatibility handling depending on the client used
        const actualMonth = periodMonth || (period ? period.split('-')[1].replace('Q', '0') : 1);
        const actualYear = periodYear || (period ? period.split('-')[0] : new Date().getFullYear());
        let sumTonnes = parseFloat(quantityTonnes || 0);
        if (scope1 || scope2 || scope3) {
            sumTonnes += parseFloat(scope1 || 0) + parseFloat(scope2 || 0) + parseFloat(scope3 || 0);
        }

        if (!actualMonth || !actualYear || (!sumTonnes && sumTonnes !== 0) || !(emissionSource || period)) {
            return res.status(400).json({ success: false, message: 'Required fields are missing' });
        }

        let evidenceFileName = undefined;
        let evidenceUrl = undefined;

        if (req.file) {
            evidenceFileName = req.file.originalname;
            const ipfsHash = await pinataUtil.uploadFile(req.file.buffer, evidenceFileName, req.file.mimetype);
            evidenceUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        }

        // Map frontend JSON strings back to objects (if they are passed as JSON strings via form-data)
        const parsedWaste = wasteGeneration ? JSON.parse(wasteGeneration) : undefined;
        const parsedLogistics = logisticsTransport ? JSON.parse(logisticsTransport) : undefined;
        const parsedVehicles = vehicleEmissions ? JSON.parse(vehicleEmissions) : undefined;
        const parsedProduction = productionOutput ? JSON.parse(productionOutput) : undefined;

        const emission = await EmissionEntry.create({
            company: req.user.company,
            periodMonth: actualMonth,
            periodYear: actualYear,
            quantityTonnes: sumTonnes,
            emissionSource: emissionSource || 'Aggregated Scopes',
            notes: notes || 'Submitted via script',
            location,
            wasteGeneration: parsedWaste,
            logisticsTransport: parsedLogistics,
            vehicleEmissions: parsedVehicles,
            productionOutput: parsedProduction,
            evidenceFileName,
            evidenceUrl,
            status: 'submitted' // Starts at submitted, awaits AI check -> 'pending_govt_assignment'
        });

        // Auto-Trigger the AI Check in the background
        try {
            await internalTriggerAICheck(emission._id);
        } catch (aiError) {
            console.error('Failed to run AI check automatically on submission:', aiError.message);
        }

        // Log SUBMISSION event to the decentralized ledger (non-blocking)
        const Company = require('../models/Company');
        const company = await Company.findById(req.user.company);
        logBlockchainEvent({
            eventType: 'SUBMISSION',
            submission: emission,
            company,
            details: `Industry submitted ${sumTonnes} tCO₂e for period ${actualMonth}/${actualYear}. Source: ${emissionSource || 'Mixed'}.`,
            actor: 'industry'
        });

        // Notify government users
        const govUsers = await User.find({ role: 'government', isActive: true });

        // Create notifications for all gov admins (in production, targeted by jurisdiction)
        const notifications = govUsers.map(govUser => ({
            user: govUser._id,
            type: 'compliance_alert',
            title: 'New Emission Report',
            message: `A new emission report of ${sumTonnes} tCO2e was submitted and processed.`
        }));
        await Notification.insertMany(notifications);

        broadcastToRole('government', {
            type: 'report_submitted',
            emissionId: emission._id,
            message: 'A new emission report was submitted'
        });

        // Return the specific JSON formatting expected by the user's manual curl test
        res.status(201).json({ 
            message: "Emission submitted successfully", 
            submission: {
                _id: emission._id,
                status: emission.status,
                totalEmissions: sumTonnes,
                evidenceUrl
            },
            success: true,
            data: emission // Included so standard frontend doesn't break
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET SINGLE ENTRY
 * =========================== */
exports.getEmissionById = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        res.status(200).json({ success: true, data: emission });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE ENTRY (If Pending)
 * =========================== */
exports.updateEmission = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        if (emission.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending emissions can be updated' });
        }

        const { periodMonth, periodYear, quantityTonnes, emissionSource, notes } = req.body;

        emission.periodMonth = periodMonth || emission.periodMonth;
        emission.periodYear = periodYear || emission.periodYear;
        emission.quantityTonnes = quantityTonnes || emission.quantityTonnes;
        emission.emissionSource = emissionSource || emission.emissionSource;
        emission.notes = notes || emission.notes;

        if (req.file) {
            emission.evidenceFileName = req.file.originalname;
            emission.evidenceUrl = await cloudinaryUtil.uploadFile(
                req.file.buffer,
                emission.evidenceFileName,
                req.file.mimetype
            );
        }

        await emission.save();
        res.status(200).json({ success: true, data: emission });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * DELETE ENTRY (If Pending)
 * =========================== */
exports.deleteEmission = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        if (emission.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending emissions can be deleted' });
        }

        await emission.deleteOne();
        res.status(200).json({ success: true, message: 'Emission entry deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CALCULATE EMISSIONS
 * =========================== */
exports.calculateEmissions = async (req, res, next) => {
    try {
        const breakdown = await calculateCO2e(req.body);
        res.status(200).json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * AI EMISSIONS ESTIMATOR (LLM)
 * =========================== */
exports.estimateEmissionAI = async (req, res, next) => {
    try {
        const { scope, category, dynamicFields, description, location } = req.body;

        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        const useLLM = apiKey && !apiKey.startsWith('your_') && apiKey.length > 10;

        let totalCO2e = null;
        let calculationMethodology = '';
        let source = 'Rule-based GHG Formula';

        // 1. Fallback / Rule-based calculator logic
        const calculateFallback = () => {
            let val = 0;
            let explanation = '';
            
            // Extract a primary quantity if present
            const quantity = parseFloat(
                dynamicFields?.fuelQuantity || 
                dynamicFields?.outputQuantity || 
                dynamicFields?.consumptionKwh || 
                dynamicFields?.cargoWeight || 
                dynamicFields?.wasteQuantity || 
                dynamicFields?.travelDistance || 
                0
            );

            if (category === 'Fuel Consumption') {
                const fuelType = dynamicFields?.fuelType || 'Diesel';
                const unit = dynamicFields?.unit || 'Liters';
                
                // standard GHG factors (kg CO2 per unit)
                let factor = 2.68; // Diesel Liter
                if (fuelType === 'Petrol') factor = 2.31;
                else if (fuelType === 'Coal') factor = 2420.0; // kg per ton
                else if (fuelType === 'Natural Gas') factor = 1.9; // kg per m3
                
                let quantityMultiplier = quantity;
                if (unit === 'Kg' && fuelType === 'Coal') quantityMultiplier = quantity / 1000.0; // to tons

                val = (quantityMultiplier * factor) / 1000.0; // to tonnes tCO2e
                explanation = `Calculated using standard GHG emission factor for ${fuelType} of ${factor} kg CO2e per ${unit}.`;
            } else if (category === 'Electricity Consumption') {
                const electricitySource = dynamicFields?.energySource || 'Grid Electricity';
                const renewPct = parseFloat(dynamicFields?.renewablePercentage || 0);
                
                let factor = 0.82; // Indian Grid average (kg CO2e per kWh)
                if (electricitySource === 'Solar' || electricitySource === 'Wind' || electricitySource === 'Hydropower') {
                    factor = 0.05; // tiny lifecycle emissions
                }

                let raw = (quantity * factor) / 1000.0;
                if (renewPct > 0) {
                    raw = raw * (1 - (renewPct / 100));
                }
                val = raw;
                explanation = `Calculated using emission factor of ${factor} kg/kWh, adjusted for ${renewPct}% renewable mix.`;
            } else if (category === 'Company-Owned Vehicles') {
                const dist = parseFloat(dynamicFields?.distanceTraveled || 0);
                // Approx 0.12 kg/km for light vehicles
                val = (dist * 0.12) / 1000.0;
                explanation = `Estimated based on average vehicle carbon intensity of 0.12 kg CO2e per km for ${dist} km.`;
            } else if (category === 'Transportation & Logistics') {
                const weight = parseFloat(dynamicFields?.cargoWeight || 0);
                const distance = parseFloat(dynamicFields?.transportDistance || 0);
                const mode = dynamicFields?.transportMode || 'Truck';
                
                let factor = 0.1; // kg/tonne-km
                if (mode === 'Air') factor = 0.8;
                else if (mode === 'Ship') factor = 0.02;
                else if (mode === 'Train') factor = 0.04;

                val = (weight * distance * factor) / 1000.0;
                explanation = `Calculated cargo weight (${weight} tons) over distance (${distance} km) using mode ${mode} (factor: ${factor} kg/t-km).`;
            } else if (category === 'Waste Management') {
                const wasteType = dynamicFields?.wasteType || 'Solid';
                const recyclePct = parseFloat(dynamicFields?.recyclingPercentage || 0);
                
                let factor = 0.5; // default 0.5 kg CO2e per kg
                if (wasteType === 'Hazardous') factor = 1.2;
                else if (wasteType === 'Liquid') factor = 0.3;

                let raw = (quantity * factor) / 1000.0;
                if (recyclePct > 0) {
                    raw = raw * (1 - (recyclePct / 100));
                }
                val = raw;
                explanation = `Calculated waste volume (${quantity} kg) using factor of ${factor} kg/kg, minus ${recyclePct}% recycling abatement.`;
            } else {
                // Generic fallback
                const multiplier = scope == 1 ? 1.2 : scope == 2 ? 0.8 : 0.5;
                val = quantity * multiplier;
                explanation = `Generic estimation using fallback sector multiplier of ${multiplier} tCO2e per activity unit.`;
            }

            return {
                totalCO2e: Math.round(val * 100) / 100,
                calculationMethodology: explanation
            };
        };

        // 2. LLM / OpenRouter logic
        if (useLLM) {
            try {
                const prompt = `You are a carbon footprint and ESG reporting AI assistant trained specifically on the Greenhouse Gas (GHG) Protocol Corporate Standard.
Your task is to estimate the carbon emissions in metric tonnes of CO2 equivalent (tCO2e) based on the provided activity data.

INPUT DATA:
- Scope: ${scope || 'Unknown'}
- Category: ${category}
- Activity Fields: ${JSON.stringify(dynamicFields)}
- Location: ${location || 'Not specified'}
- Additional Description: ${description || 'None'}

Please calculate the direct or indirect emissions using the standard GHG Protocol emission factors (such as DEFRA, US EPA, or India grid factors). 
Your output MUST be a valid JSON object. Do not include any explanation outside the JSON.
The JSON object must have exactly these keys:
{
  "totalCO2e": 45.2, // a number representing the calculated tCO2e emissions
  "calculationMethodology": "Detailed step-by-step math and factors used for calculation"
}`;

                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'meta-llama/llama-3.1-70b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'http://localhost:5173',
                            'X-Title': 'EcoChain AI Estimator'
                        },
                        timeout: 15000 // 15s timeout
                    }
                );

                const choice = response.data?.choices?.[0]?.message?.content;
                if (choice) {
                    const parsed = JSON.parse(choice.trim());
                    if (typeof parsed.totalCO2e === 'number' && parsed.calculationMethodology) {
                        totalCO2e = Math.round(parsed.totalCO2e * 100) / 100;
                        calculationMethodology = parsed.calculationMethodology;
                        source = 'OpenAI / OpenRouter GHG Model';
                    }
                }
            } catch (err) {
                console.error("OpenRouter API request failed, falling back to local formulas:", err.message);
            }
        }

        // Apply fallback if LLM estimation was skipped, failed, or timed out
        if (totalCO2e === null) {
            const fallbackResult = calculateFallback();
            totalCO2e = fallbackResult.totalCO2e;
            calculationMethodology = fallbackResult.calculationMethodology;
        }

        res.status(200).json({
            success: true,
            data: {
                totalCO2e,
                calculationMethodology,
                source
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET MY COMPLIANCE STATUS (Industry Self-View)
 * =========================== */
exports.getMyCompliance = async (req, res, next) => {
    try {
        const Company = require('../models/Company');
        const company = await Company.findById(req.user.company);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        // All approved emissions (total reported so far)
        const allEmissions = await EmissionEntry.find({ company: company._id });
        const approvedEmissions = allEmissions.filter(e => e.status === 'approved');

        const totalSubmitted = allEmissions.reduce((s, e) => s + (e.quantityTonnes || 0), 0);
        const totalApproved = approvedEmissions.reduce((s, e) => s + (e.quantityTonnes || 0), 0);
        const cap = company.annualCarbonBudget || 10000;
        const creditBalance = company.creditBalance || 0;
        const netEmissions = Math.max(0, totalApproved - creditBalance);
        const percentOfCap = cap > 0 ? (netEmissions / cap) * 100 : 0;

        let status = 'Compliant';
        if (netEmissions > cap) status = 'Non-compliant';
        else if (netEmissions > cap * 0.9) status = 'At Risk';

        // Monthly breakdown for chart
        const monthlyData = [];
        for (let m = 1; m <= 12; m++) {
            const monthEntries = approvedEmissions.filter(e => Number(e.periodMonth) === m);
            const total = monthEntries.reduce((s, e) => s + (e.quantityTonnes || 0), 0);
            monthlyData.push({
                month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1],
                emissions: Math.round(total * 10) / 10,
                cap: Math.round((cap / 12) * 10) / 10
            });
        }

        // Status counts of all submitted reports
        const statusCounts = {
            submitted: allEmissions.filter(e => ['submitted','pending'].includes(e.status)).length,
            approved: allEmissions.filter(e => e.status === 'approved').length,
            under_review: allEmissions.filter(e => ['under_review','pending_audit','ai_checking','ai_flagged','pending_govt_assignment','awaiting_second_auditor'].includes(e.status)).length,
            rejected: allEmissions.filter(e => e.status === 'rejected').length,
            correction_requested: allEmissions.filter(e => e.status === 'correction_requested').length,
        };

        res.status(200).json({
            success: true,
            data: {
                company: {
                    id: company._id,
                    name: company.name,
                    sector: company.sector,
                    cap,
                    creditBalance,
                    penalty: company.penalty || 0,
                    complianceStatus: company.complianceStatus,
                    verificationStatus: company.verificationStatus,
                },
                compliance: {
                    status,
                    totalSubmitted: Math.round(totalSubmitted * 10) / 10,
                    totalApproved: Math.round(totalApproved * 10) / 10,
                    netEmissions: Math.round(netEmissions * 10) / 10,
                    percentOfCap: Math.round(percentOfCap * 10) / 10,
                    remainingBudget: Math.round(Math.max(0, cap - netEmissions) * 10) / 10,
                },
                monthlyData,
                statusCounts,
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET SUBMISSION TIMELINE
 * Returns: emission entry + AI result + audit reviews + blockchain events
 * =========================== */
exports.getSubmissionTimeline = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Submission not found' });

        const [aiReport, reviewDoc, blockchainEvents] = await Promise.all([
            AnomalyReport.findOne({ submission: emission._id }),
            ReportReview.findOne({ report: emission._id })
                .populate('auditors.auditorId', 'name email'),
            BlockchainEvent.find({ submissionId: emission._id }).sort({ createdAt: 1 })
        ]);

        // Build a unified timeline array
        const timeline = [];

        // 1. Submission event
        timeline.push({
            type: 'SUBMISSION',
            label: 'Report Submitted',
            detail: `Emission report of ${emission.quantityTonnes} tCO₂e submitted for ${emission.periodMonth}/${emission.periodYear}.`,
            at: emission.createdAt,
            icon: 'upload_file',
            color: 'blue'
        });

        // 2. AI check events from blockchain log
        blockchainEvents.forEach(evt => {
            const labelMap = {
                SUBMISSION: null, // already added above
                ASSIGNED: 'Auditor(s) Assigned',
                AUDIT: 'Audit Decision Recorded',
                MINT: 'Carbon Credits Minted'
            };
            if (labelMap[evt.eventType]) {
                timeline.push({
                    type: evt.eventType,
                    label: labelMap[evt.eventType],
                    detail: evt.details,
                    txHash: evt.txHash,
                    dataHash: evt.dataHash,
                    at: evt.createdAt,
                    icon: evt.eventType === 'MINT' ? 'generating_tokens' : evt.eventType === 'ASSIGNED' ? 'person_add' : 'verified',
                    color: evt.eventType === 'MINT' ? 'violet' : evt.eventType === 'AUDIT' ? 'green' : 'indigo'
                });
            }
        });

        // 3. Auditor review decisions
        if (reviewDoc?.auditors?.length) {
            reviewDoc.auditors.forEach(a => {
                if (a.signedAt) {
                    const decisionColor = a.decision === 'approved' ? 'green' : a.decision === 'rejected' ? 'red' : 'orange';
                    timeline.push({
                        type: 'REVIEW',
                        label: `${a.role === 'primary' ? 'Primary' : 'Secondary'} Auditor Decision`,
                        detail: `${a.auditorId?.name || 'Auditor'}: ${a.decision?.replace(/_/g, ' ')}. ${a.remarks || ''}`,
                        at: a.signedAt,
                        icon: a.decision === 'approved' ? 'check_circle' : a.decision === 'rejected' ? 'cancel' : 'edit_note',
                        color: decisionColor
                    });
                }
            });
            if (reviewDoc.finalDecisionAt) {
                timeline.push({
                    type: 'FINAL_DECISION',
                    label: 'Final Audit Decision',
                    detail: `Final outcome: ${reviewDoc.finalDecision?.replace(/_/g, ' ')}.`,
                    at: reviewDoc.finalDecisionAt,
                    icon: reviewDoc.finalDecision === 'approved' ? 'task_alt' : 'gpp_bad',
                    color: reviewDoc.finalDecision === 'approved' ? 'green' : 'red'
                });
            }
        }

        // Sort timeline by date ascending
        timeline.sort((a, b) => new Date(a.at) - new Date(b.at));

        const aiResult = aiReport ? {
            riskScore: aiReport.finalRiskScore,
            riskFlag: aiReport.riskFlag,
            explanation: aiReport.explanation,
            benchmarkDeviationPct: aiReport.benchmarkDeviationPct,
            expectedEmission: aiReport.expectedEmission
        } : null;

        const auditSummary = reviewDoc ? {
            finalDecision: reviewDoc.finalDecision,
            finalDecisionAt: reviewDoc.finalDecisionAt,
            correctionRequired: reviewDoc.correctionRequired,
            documentChecklist: reviewDoc.documentChecklist,
            auditors: reviewDoc.auditors.map(a => ({
                name: a.auditorId?.name || 'Auditor',
                email: a.auditorId?.email,
                role: a.role,
                decision: a.decision,
                remarks: a.remarks,
                signedAt: a.signedAt
            }))
        } : null;

        res.status(200).json({
            success: true,
            data: {
                emission,
                aiResult,
                auditSummary,
                blockchainEvents: blockchainEvents.map(e => ({
                    eventType: e.eventType,
                    txHash: e.txHash,
                    dataHash: e.dataHash,
                    details: e.details,
                    actor: e.actor,
                    createdAt: e.createdAt
                })),
                timeline
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * RESUBMIT CORRECTION (Industry)
 * Allows industry to resubmit a rejected/correction_requested report
 * =========================== */
exports.resubmitEmission = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Submission not found' });

        if (!['rejected', 'correction_requested'].includes(emission.status)) {
            return res.status(400).json({ success: false, message: 'Only rejected or correction-requested submissions can be resubmitted' });
        }

        const { correctionNote, quantityTonnes, emissionSource, notes } = req.body;

        // Update fields if provided
        if (quantityTonnes) emission.quantityTonnes = parseFloat(quantityTonnes);
        if (emissionSource) emission.emissionSource = emissionSource;
        if (notes) emission.notes = notes;
        if (correctionNote) emission.notes = `[Correction: ${correctionNote}]\n${emission.notes}`;

        emission.status = 'submitted';
        emission.rejectionReason = undefined;
        await emission.save();

        // Re-trigger AI check
        try {
            await internalTriggerAICheck(emission._id);
        } catch (aiErr) {
            console.error('AI re-check failed on resubmit:', aiErr.message);
        }

        // Notify government
        const govUsers = await User.find({ role: 'government', isActive: true }).select('_id');
        const notifs = govUsers.map(g => ({
            user: g._id,
            type: 'compliance_alert',
            title: 'Resubmitted Emission Report',
            message: `Industry resubmitted an emission report after correction. Needs review.`
        }));
        await Notification.insertMany(notifs);

        res.status(200).json({ success: true, message: 'Resubmission successful', data: emission });
    } catch (error) {
        next(error);
    }
};
