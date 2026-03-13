const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The receiver

    type: {
        type: String,
        enum: [
            'report_approved', 
            'report_rejected', 
            'credits_issued', 
            'trade_completed', 
            'compliance_alert',
            'pending_govt_assignment',
            'auditor_assigned',
            'correction_requested',
            'awaiting_second_auditor',
            'credit_transferred',
            'brsr_report_ready',
            'govt_anomaly_reviewed'
        ]
    },
    title: String,
    message: String,

    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
