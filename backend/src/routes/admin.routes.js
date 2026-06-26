// admin.routes.js — DEV ONLY: provides quick helpers for demo/testing
// These routes are ONLY enabled in development (HACKATHON_MODE=true)
const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

// Middleware: only allow in hackathon mode
router.use((req, res, next) => {
    if (process.env.HACKATHON_MODE === 'false') {
        return res.status(403).json({ success: false, message: 'Admin routes are only available in HACKATHON_MODE.' });
    }
    next();
});

/**
 * POST /api/admin/mint-credits
 * Body: { email: "industry@email", amount: 100 }
 * Mints (adds) credits directly to an industry user's DB balance.
 * This simulates what the government does on-chain, for demo purposes when
 * Sepolia transactions are unavailable.
 */
router.post('/mint-credits', async (req, res) => {
    try {
        const { email, amount = 100, walletAddress } = req.body;

        if (!email && !walletAddress) {
            return res.status(400).json({ success: false, message: 'Provide email or walletAddress' });
        }

        // Find user by email
        const user = email
            ? await User.findOne({ email: email.toLowerCase() }).select('_id company email firstName')
            : null;

        if (email && !user) {
            return res.status(404).json({ success: false, message: `User with email '${email}' not found` });
        }

        const companyId = user?.company;
        if (!companyId) {
            return res.status(400).json({ success: false, message: 'User has no associated company' });
        }

        // Add credits to company balance
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const prevBalance = company.creditBalance || 0;
        company.creditBalance = prevBalance + Number(amount);
        await company.save();

        // Create transaction record
        await CreditTransaction.create({
            company: companyId,
            type: 'issued',
            amount: Number(amount),
            txHash: `0xDEV_MINT_${Date.now()}`,
            notes: `DEV: Admin minted ${amount} CCR for testing`
        });

        return res.status(200).json({
            success: true,
            message: `✅ Minted ${amount} CCR to ${company.name}`,
            data: {
                company: company.name,
                previousBalance: prevBalance,
                newBalance: company.creditBalance,
                minted: Number(amount)
            }
        });
    } catch (error) {
        console.error('[ADMIN] mint-credits error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/admin/balances
 * Lists all company credit balances for quick overview
 */
router.get('/balances', async (req, res) => {
    try {
        const companies = await Company.find().select('name sector creditBalance walletAddress');
        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/admin/reset-balance
 * Resets a company balance back to 0 — useful for re-testing revoke flows
 */
router.post('/reset-balance', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase() });
        if (!user?.company) return res.status(404).json({ success: false, message: 'User/company not found' });

        await Company.findByIdAndUpdate(user.company, { creditBalance: 0 });
        res.status(200).json({ success: true, message: 'Balance reset to 0' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
