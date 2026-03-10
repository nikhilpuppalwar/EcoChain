const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    sector: { type: String, enum: ['Energy', 'Cement', 'Steel', 'Mining', 'Transport', 'Other'], required: true },
    state: String,
    registrationNo: String, // CIN / LLPIN
    taxId: String,          // PAN
    annualCarbonBudget: Number, // tCO2e/yr limit
    walletAddress: { type: String, trim: true }, // Ethereum Wallet Address for Web3 integration

    complianceStatus: { type: String, enum: ['compliant', 'non-compliant', 'pending'], default: 'pending' },
    creditBalance: { type: Number, default: 0 }, // Mirrored off-chain balance

    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);
