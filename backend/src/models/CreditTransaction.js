const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
    fromCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    toCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    credits: { type: Number, required: true },
    pricePerCredit: { type: Number }, // Only if type is sale/purchase
    totalValue: { type: Number },

    type: { type: String, enum: ['purchase', 'sale', 'issuance', 'retirement', 'transfer'], required: true },

    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing' }, // If from marketplace
    txHash: String, // Web3 transaction

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
