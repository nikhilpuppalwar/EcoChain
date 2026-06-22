const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    creditsAvailable: { type: Number, required: true },
    pricePerCredit: { type: Number, required: true }, // in INR or ETH equivalent

    expiresAt: Date,
    status: { type: String, enum: ['active', 'sold', 'cancelled'], default: 'active' },
    txHash: String, // Blockchain transaction hash once phase 2 is integrated
    onChainId: Number, // Links to Solidity mapping

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
