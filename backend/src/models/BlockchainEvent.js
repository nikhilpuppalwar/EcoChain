const mongoose = require('mongoose');

// Stores one record per workflow event for the public decentralized ledger
const blockchainEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ['SUBMISSION', 'ASSIGNED', 'AUDIT', 'MINT'],
        required: true
    },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionEntry', required: true },
    companyName: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    quantityTonnes: { type: Number },
    period: { type: String }, // e.g. "03/2026"
    txHash: { type: String }, // real blockchain tx hash (null if blockchain offline)
    dataHash: { type: String }, // deterministic hash of the data for tamper-proofing
    details: { type: String }, // human-readable summary
    actor: { type: String }, // who triggered this event (role)
    createdAt: { type: Date, default: Date.now }
});

blockchainEventSchema.index({ submissionId: 1, eventType: 1 });
blockchainEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BlockchainEvent', blockchainEventSchema);
