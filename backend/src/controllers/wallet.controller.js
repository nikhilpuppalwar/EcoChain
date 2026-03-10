const CreditTransaction = require('../models/CreditTransaction');
const Company = require('../models/Company');

/* ===========================
 * GET MY WALLET TRANSACTIONS
 * =========================== */
exports.getMyTransactions = async (req, res, next) => {
    try {
        const transactions = await CreditTransaction.find({
            $or: [{ fromCompany: req.user.company }, { toCompany: req.user.company }]
        })
            .populate('fromCompany', 'name')
            .populate('toCompany', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * RETIRE CREDITS
 * =========================== */
exports.retireCredits = async (req, res, next) => {
    try {
        const { amount, reason, onChainTxHash } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid retirement amount' });
        }

        const company = await Company.findById(req.user.company);

        if (company.creditBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient credit balance to retire' });
        }

        // Deduct balance
        company.creditBalance -= amount;

        // In strict compliance mode, if credits retired > required, set to compliant
        // Simplified for hackathon: Assuming any retirement means working towards compliance
        await company.save();

        // Create Retirement TX Record
        const transaction = await CreditTransaction.create({
            fromCompany: company._id,
            credits: amount,
            type: 'retirement',
            txHash: onChainTxHash // From frontend web3 tx
        });

        res.status(200).json({
            success: true,
            message: `${amount} credits retired successfully`,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};
