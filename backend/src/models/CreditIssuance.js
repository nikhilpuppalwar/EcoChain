const mongoose = require('mongoose');

const creditIssuanceSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Govt Officer ID

    credits: { type: Number, required: true },
    reason: { type: String, required: true },

    validityDate: Date,
    metadataCID: String, // IPFS CID of credit metadata JSON

    txHash: String, // Web3 transaction
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditIssuance', creditIssuanceSchema);
