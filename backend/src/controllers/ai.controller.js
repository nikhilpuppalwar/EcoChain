const axios = require('axios');
const FormData = require('form-data');
const AiForecast = require('../models/AiForecast');
const AnomalyReport = require('../models/AnomalyReport');
const EmissionEntry = require('../models/EmissionEntry');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const { broadcastToRole } = require('../utils/websocket');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/* ===========================
 * INTERNAL HELPER — Build AI payload from emission entry
 * =========================== */
function buildRiskPayload(emission, company) {
    const totalEmission = emission.quantityTonnes || 0;

    // Fuel total from vehicleEmissions or logisticsTransport
    let fuelTotal = 0;
    if (emission.vehicleEmissions && Array.isArray(emission.vehicleEmissions)) {
        fuelTotal += emission.vehicleEmissions.reduce((s, v) => s + (v.fuelQuantity || 0), 0);
    }
    if (emission.logisticsTransport && Array.isArray(emission.logisticsTransport)) {
        fuelTotal += emission.logisticsTransport.reduce((s, l) => s + (l.cargoWeightTons || 0), 0);
    }

    // Production output
    const production = emission.productionOutput?.quantity || 1;
    const electricity = emission.productionOutput?.operatingHours || 0;  // use as proxy
    const ratio = production > 0 ? totalEmission / production : 0;

    return {
        submission_id: emission._id.toString(),
        industry_id:   (emission.company?._id || emission.company).toString(),
        industry_type: company?.sector?.toLowerCase() || 'other',
        production_rate: production,
        emission_level: totalEmission,
        fuel_consumption: fuelTotal,
        electricity_usage: electricity,
        emission_to_production_ratio: parseFloat(ratio.toFixed(6))
    };
}

/* ===========================
 * INTERNAL REUSABLE AI CHECK LOGIC
 * =========================== */
exports.internalTriggerAICheck = async (emissionId) => {
    const emission = await EmissionEntry.findById(emissionId).populate('company');
    if (!emission) throw new Error('Submission not found');

    const company = emission.company;
    const payload = buildRiskPayload(emission, company);

    // Call Python AI service
    let aiResponse;
    try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/risk-score`, payload, { timeout: 30000 });
    } catch (aiError) {
        console.error('AI Service Error:', aiError.message);
        throw new Error('AI service is unavailable. Please try again later.');
    }

    const aiData = aiResponse.data.data;

    // Check if an existing report exists (re-trigger scenario)
    let report = await AnomalyReport.findOne({ submission: emission._id });

    if (report) {
        // Save old result to history
        report.previousResults.push({ riskScore: report.finalRiskScore, riskFlag: report.riskFlag });
        report.retriggerCount += 1;
    } else {
        report = new AnomalyReport({ submission: emission._id, company: company._id });
    }

    // Update with new AI result
    report.finalRiskScore        = aiData.final_risk_score;
    report.riskFlag              = aiData.risk_flag;
    report.isFlagged             = aiData.is_flagged;
    report.anomalyScore          = aiData.anomaly_score;
    report.satelliteScore        = aiData.satellite_score;
    report.benchmarkScore        = aiData.benchmark_score;
    report.anomalyResult         = aiData.anomaly_result;
    report.benchmarkDeviationPct = aiData.benchmark_deviation_pct;
    report.expectedEmission      = aiData.expected_emission || 0;
    report.explanation           = aiData.explanation;
    report.checkedAt             = new Date();
    report.governmentReviewStatus = 'pending';

    await report.save();

    // Update emission status
    emission.status = aiData.is_flagged ? 'ai_flagged' : 'pending_govt_assignment';
    await emission.save();

    // Broadcast to government room
    broadcastToRole('government', {
        type: aiData.is_flagged ? 'anomaly:alert' : 'assignment:pending',
        submissionId: emission._id,
        riskFlag: aiData.risk_flag,
        riskScore: aiData.final_risk_score,
        companyName: company.name,
        explanation: aiData.explanation
    });

    return { emission, anomalyReport: report };
};

/* ===========================
 * GOVERNMENT — MANUALLY TRIGGER AI CHECK ON A SUBMISSION
 * POST /api/ai/trigger-check/:submissionId
 * =========================== */
exports.triggerAICheck = async (req, res, next) => {
    try {
        const result = await exports.internalTriggerAICheck(req.params.submissionId);
        res.status(200).json({ success: true, message: 'AI check completed', data: result });
    } catch (error) {
        if (error.message.includes('unavailable')) {
            return res.status(503).json({ success: false, message: error.message, fallback: true });
        }
        next(error);
    }
};

/* ===========================
 * GET AI RESULT FOR A SUBMISSION
 * GET /api/ai/results/:submissionId
 * Auth: government + auditor
 * =========================== */
exports.getAIResult = async (req, res, next) => {
    try {
        const report = await AnomalyReport.findOne({ submission: req.params.submissionId })
            .populate('submission', 'periodMonth periodYear quantityTonnes emissionSource status company')
            .populate('company', 'name sector')
            .populate('reviewedBy', 'firstName lastName email');

        if (!report) {
            return res.status(404).json({ success: false, message: 'No AI result found for this submission' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET ALL FLAGGED SUBMISSIONS
 * GET /api/ai/flagged
 * Auth: government
 * =========================== */
exports.getFlaggedSubmissions = async (req, res, next) => {
    try {
        const { status, riskLevel, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { isFlagged: true };
        if (status) query.governmentReviewStatus = status;
        if (riskLevel === 'high')   query.riskFlag = 'RED';
        if (riskLevel === 'medium') query.riskFlag = 'YELLOW';
        if (riskLevel === 'low')    query.riskFlag = 'GREEN';

        const [reports, total] = await Promise.all([
            AnomalyReport.find(query)
                .populate('submission', 'periodMonth periodYear quantityTonnes emissionSource status createdAt')
                .populate('company', 'name sector')
                .sort({ finalRiskScore: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AnomalyReport.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: reports,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET ALL AI RESULTS (Live feed for G3)
 * GET /api/ai/all
 * Auth: government
 * =========================== */
exports.getAllAIResults = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reports, total] = await Promise.all([
            AnomalyReport.find()
                .populate('submission', 'periodMonth periodYear quantityTonnes emissionSource status createdAt')
                .populate('company', 'name sector')
                .sort({ checkedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AnomalyReport.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: reports,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GOVERNMENT — MARK ANOMALY REVIEWED / ESCALATED
 * PATCH /api/ai/anomaly/:id/review
 * =========================== */
exports.reviewAnomalyReport = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        if (!['reviewed', 'escalated'].includes(status)) {
            return res.status(400).json({ success: false, message: 'status must be reviewed or escalated' });
        }

        const report = await AnomalyReport.findById(req.params.id).populate('company', 'name adminUser');
        if (!report) return res.status(404).json({ success: false, message: 'Anomaly report not found' });

        report.governmentReviewStatus = status;
        report.reviewedBy  = req.user._id;
        report.reviewedAt  = new Date();
        report.reviewNotes = notes || '';
        await report.save();

        // If escalated — notify all government users
        if (status === 'escalated') {
            broadcastToRole('government', {
                type: 'anomaly:escalated',
                reportId: report._id,
                riskScore: report.finalRiskScore,
                companyName: report.company?.name
            });
        }

        res.status(200).json({ success: true, message: `Anomaly marked as ${status}`, data: report });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET REPEAT OFFENDERS
 * GET /api/ai/repeat-offenders
 * Auth: government
 * =========================== */
exports.getRepeatOffenders = async (req, res, next) => {
    try {
        // Companies flagged 2+ times in last 4 periods
        const fourPeriodsAgo = new Date();
        fourPeriodsAgo.setMonth(fourPeriodsAgo.getMonth() - 12); // ~4 quarters

        const offenders = await AnomalyReport.aggregate([
            { $match: { isFlagged: true, checkedAt: { $gte: fourPeriodsAgo } } },
            { $group: { _id: '$company', count: { $sum: 1 }, lastFlagDate: { $max: '$checkedAt' }, maxRiskScore: { $max: '$finalRiskScore' } } },
            { $match: { count: { $gte: 2 } } },
            { $sort: { count: -1 } }
        ]);

        // Populate company details
        const Company = require('../models/Company');
        const populated = await Promise.all(offenders.map(async (o) => {
            const company = await Company.findById(o._id).select('name sector');
            return { ...o, company };
        }));

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET / GENERATE FORECAST (existing — industry)
 * =========================== */
exports.getForecast = async (req, res, next) => {
    try {
        const company = await Company.findById(req.user.company);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        const payload = { companyName: company.name, sector: company.sector, annualBudget: company.annualCarbonBudget };

        let aiResponse;
        try {
            aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast`, payload);
        } catch (aiError) {
            console.error('AI Service Error:', aiError.message);
            return res.status(503).json({ success: false, message: 'AI Forecasting service is currently unavailable.' });
        }

        const forecast = await AiForecast.create({
            company: req.user.company,
            forecastPeriod: aiResponse.data.period || 'Next Quarter',
            predictedEmissions: aiResponse.data.predicted_emissions || 0,
            predictedCreditsNeeded: aiResponse.data.predicted_credits_needed || 0,
            riskLevel: aiResponse.data.risk_level || 'Low',
            modelConfidence: aiResponse.data.confidence || 85,
        });

        res.status(200).json({ success: true, data: forecast });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET FORECAST HISTORY (existing — industry)
 * =========================== */
exports.getForecastHistory = async (req, res, next) => {
    try {
        const forecasts = await AiForecast.find({ company: req.user.company })
            .sort({ generatedAt: -1 })
            .limit(10);
        res.status(200).json({ success: true, data: forecasts });
    } catch (error) {
        next(error);
    }
};
