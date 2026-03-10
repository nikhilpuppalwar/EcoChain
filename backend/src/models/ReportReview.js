const mongoose = require('mongoose');

const reportReviewSchema = new mongoose.Schema({
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionEntry', required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Gov Officer

    action: { type: String, enum: ['approved', 'rejected'], required: true },
    reason: { type: String }, // Mandatory if rejected

    reviewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportReview', reportReviewSchema);
