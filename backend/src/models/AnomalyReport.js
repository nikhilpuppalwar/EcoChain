const mongoose = require('mongoose');

/**
 * AnomalyReport — stores the full AI risk assessment result for each emission submission.
 * Created by the backend immediately after calling the Python AI service.
 */
const anomalyReportSchema = new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmissionEntry',
        required: true,
        unique: true  // one AI report per submission
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    // ── Final Risk Score ──────────────────────────────────────
    finalRiskScore:  { type: Number, required: true },       // 0–100 weighted
    riskFlag:        { type: String, enum: ['GREEN', 'YELLOW', 'RED'], required: true },
    isFlagged:       { type: Boolean, default: false },       // true if YELLOW or RED

    // ── Component Scores ─────────────────────────────────────
    anomalyScore:    { type: Number, default: 0 },           // 0 or 100 from IsolationForest
    satelliteScore:  { type: Number, default: 5 },           // 5 or 40 from smoke detection
    benchmarkScore:  { type: Number, default: 5 },           // 5, 25, or 50 from sector comparison

    // ── Anomaly Detail ───────────────────────────────────────
    anomalyResult:   { type: String, enum: ['NORMAL', 'ANOMALY'], default: 'NORMAL' },
    benchmarkDeviationPct: { type: Number, default: 0 },     // % deviation from sector benchmark
    expectedEmission: { type: Number, default: 0 },          // expected tCO2e from benchmark
    smokeDetected:   { type: Boolean, default: null },        // null if no image was uploaded
    explanation:     { type: String, default: '' },           // human-readable summary for G3 portal

    // ── Government Review ────────────────────────────────────
    governmentReviewStatus: {
        type: String,
        enum: ['pending', 'reviewed', 'escalated'],
        default: 'pending'
    },
    reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:      { type: Date, default: null },
    reviewNotes:     { type: String, default: '' },

    // ── Re-trigger History ───────────────────────────────────
    retriggerCount:  { type: Number, default: 0 },           // how many times AI was re-run
    previousResults: [{                                       // keeps history if re-triggered
        riskScore: Number,
        riskFlag:  String,
        checkedAt: { type: Date, default: Date.now }
    }],

    checkedAt: { type: Date, default: Date.now }
}, { timestamps: true });

anomalyReportSchema.index({ company: 1, isFlagged: 1 });
anomalyReportSchema.index({ riskFlag: 1, governmentReviewStatus: 1 });

module.exports = mongoose.model('AnomalyReport', anomalyReportSchema);
