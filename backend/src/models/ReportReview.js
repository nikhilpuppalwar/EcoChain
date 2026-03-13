const mongoose = require('mongoose');

const reportReviewSchema = new mongoose.Schema({
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionEntry', required: true },
    
    // Legacy single reviewer (kept for backwards compatibility)
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['approved', 'rejected'] },
    reason: { type: String },
    reviewedAt: { type: Date },

    // --- STEP 4 DUAL AUDITOR SUPPORT ---
    auditors: [{
        auditorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User who is an Auditor
        role: { type: String, enum: ['primary', 'secondary'] },
        decision: { type: String, enum: ['approved', 'rejected', 'correction_requested'] },
        remarks: { type: String, minlength: 10 },
        digitalSignature: String,
        certificateHash: String,
        signedAt: Date
    }],

    // Computed final decision after all auditors sign
    finalDecision: { type: String, enum: ['approved', 'rejected', 'correction_requested'], default: null },
    finalDecisionAt: { type: Date, default: null },

    // --- STEP 5 DOCUMENT CHECKLIST ---
    documentChecklist: {
        fuelInvoicesChecked: { type: Boolean, default: false },
        electricityBillsChecked: { type: Boolean, default: false },
        transportRecordsChecked: { type: Boolean, default: false },
        wasteCertsChecked: { type: Boolean, default: false },
        productionReportsChecked: { type: Boolean, default: false },
        allDocumentsVerified: { type: Boolean, default: false }
    },

    // --- STEP 5 CORRECTION REQUEST DETAILS ---
    correctionRequired: {
        fieldsToFix: { type: [String], default: [] },
        correctionNote: String
    },

    // --- STEP 6 BRSR REPORT TYPE ---
    reportType: {
        type: String,
        enum: ['BRSR', 'ESG', 'GHG', 'compliance_certificate'],
        default: 'BRSR'
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportReview', reportReviewSchema);
