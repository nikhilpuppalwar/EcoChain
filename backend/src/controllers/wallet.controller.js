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

/* ===========================
 * TRANSFER CREDITS (WALLET-TO-WALLET)
 * =========================== */
exports.transferCredits = async (req, res, next) => {
    try {
        const { recipientAddress, amount, onChainTxHash } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
        }

        const senderCompany = await Company.findById(req.user.company);
        if (senderCompany.creditBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient credit balance for transfer' });
        }

        // Find recipient company by blockchain wallet address
        // Using regex for case-insensitive match just in case
        const recipientCompany = await Company.findOne({ 
            walletAddress: { $regex: new RegExp('^' + recipientAddress + '$', 'i') } 
        });

        if (!recipientCompany) {
            return res.status(404).json({ success: false, message: 'Recipient wallet address not found or registered' });
        }

        if (senderCompany._id.toString() === recipientCompany._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot transfer to your own wallet' });
        }

        // Proceed to transfer balances off-chain to mirror on-chain state
        senderCompany.creditBalance -= amount;
        recipientCompany.creditBalance += amount;

        await senderCompany.save();
        await recipientCompany.save();

        // Log transaction
        const transaction = await CreditTransaction.create({
            fromCompany: senderCompany._id,
            toCompany: recipientCompany._id,
            credits: amount,
            type: 'transfer',
            txHash: onChainTxHash
        });

        // Notifications
        const Notification = require('../models/Notification');
        await Notification.insertMany([
            {
                user: senderCompany.adminUser,
                type: 'credit_transferred',
                title: 'Credits Transferred Successfully',
                message: `You successfully transferred ${amount} credits to ${recipientCompany.name}. Tx: ${onChainTxHash}`
            },
            {
                user: recipientCompany.adminUser,
                type: 'credit_transferred',
                title: 'Credits Received',
                message: `You received ${amount} credits from ${senderCompany.name}. Tx: ${onChainTxHash}`
            }
        ]);

        res.status(200).json({
            success: true,
            message: `${amount} credits transferred to ${recipientCompany.name}`,
            data: transaction
        });

    } catch (error) {
        next(error);
    }
};
