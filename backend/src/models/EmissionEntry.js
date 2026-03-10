const mongoose = require('mongoose');

const emissionEntrySchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    periodMonth: { type: Number, required: true, min: 1, max: 12 },
    periodYear: { type: Number, required: true },
    quantityTonnes: { type: Number, required: true },
    emissionSource: String,
    notes: String,

    evidenceCID: String, // IPFS CID 
    evidenceFileName: String, // Original filename for display

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Gov reviewer ID
    reviewedAt: Date,
    rejectionReason: String,

    txHash: String, // Blockchain transaction hash after on-chain verification
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmissionEntry', emissionEntrySchema);
