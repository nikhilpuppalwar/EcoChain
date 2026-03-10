const EmissionEntry = require('../models/EmissionEntry');
const ReportReview = require('../models/ReportReview');
const CreditIssuance = require('../models/CreditIssuance');
const CreditTransaction = require('../models/CreditTransaction');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pinataUtil = require('../utils/pinata');
const { verifyEmissionOnChain, issueCreditsOnChain } = require('../utils/blockchain');
const { sendToUser } = require('../utils/websocket');

/* ===========================
 * GET ALL REPORTS
 * =========================== */
exports.getAllReports = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const reports = await EmissionEntry.find(query)
            .populate('company', 'name sector state')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await EmissionEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            data: reports,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET SINGLE REPORT
 * =========================== */
exports.getReportById = async (req, res, next) => {
    try {
        const report = await EmissionEntry.findById(req.params.id).populate('company', 'name adminUser');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * REVIEW REPORT
 * =========================== */
exports.reviewReport = async (req, res, next) => {
    try {
        const { action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }

        if (action === 'reject' && !reason) {
            return res.status(400).json({ success: false, message: 'Reason is required for rejection' });
        }

        const report = await EmissionEntry.findById(req.params.id).populate('company');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        if (report.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Report already ${report.status}` });
        }

        report.status = action === 'approve' ? 'approved' : 'rejected';
        report.reviewedBy = req.user._id;
        report.reviewedAt = Date.now();

        if (action === 'reject') {
            report.rejectionReason = reason;
        }

        let txHashMessage = "";
        // If Approved => Log on blockchain (mocked for now)
        if (action === 'approve') {
            const txHash = await verifyEmissionOnChain(
                report.company.walletAddress || "0x_MOCK_WALLET",
                report.quantityTonnes,
                report.periodMonth,
                report.periodYear,
                report.evidenceCID || "NO_CID",
                report._id.toString()
            );
            report.txHash = txHash;
            txHashMessage = `Verified on-chain. TX: ${txHash}`;
        }

        await report.save();

        await ReportReview.create({
            report: report._id,
            reviewedBy: req.user._id,
            action: action === 'approve' ? 'approved' : 'rejected',
            reason
        });

        // Notify Industry User
        await Notification.create({
            user: report.company.adminUser,
            type: action === 'approve' ? 'report_approved' : 'report_rejected',
            title: `Emission Report ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            message: `Your emission report for ${report.periodMonth}/${report.periodYear} was ${action === 'approve' ? 'approved' : 'rejected'}. ${action === 'reject' ? 'Reason: ' + reason : txHashMessage}`
        });

        sendToUser(report.company.adminUser, {
            type: 'report_reviewed',
            status: action === 'approve' ? 'approved' : 'rejected',
            message: 'Your report was reviewed.'
        });

        res.status(200).json({ success: true, message: `Report ${action}d successfully.`, data: report });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * ISSUE CREDITS
 * =========================== */
exports.issueCredits = async (req, res, next) => {
    try {
        const { companyId, credits, reason, validityDate } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        // 1. Prepare IPFS Metadata JSON and pin it
        const metadata = {
            description: "Carbon Credits Issued by EcoChain Gov",
            attributes: [
                { trait_type: "Company", value: company.name },
                { trait_type: "Amount", value: credits },
                { trait_type: "Reason", value: reason },
                { trait_type: "Date Issued", value: new Date().toISOString() },
                { trait_type: "Validity Document", value: validityDate }
            ]
        };

        const metadataCID = await pinataUtil.uploadJSON(metadata, `Issuance_${company.name}_${Date.now()}`);

        // 2. Transact on Blockchain
        const txHash = await issueCreditsOnChain(
            company.walletAddress || "0x_MOCK_WALLET",
            credits,
            reason,
            metadataCID
        );

        // 3. Create issuance record
        const issuance = await CreditIssuance.create({
            company: company._id,
            issuedBy: req.user._id,
            credits,
            reason,
            validityDate,
            metadataCID,
            txHash
        });

        // 4. Update the Company DB Mirror Balance
        company.creditBalance += parseInt(credits);
        await company.save();

        // 5. Build CreditTransaction record
        await CreditTransaction.create({
            toCompany: company._id,
            credits,
            type: 'issuance',
            txHash
        });

        // 6. Notify Company
        await Notification.create({
            user: company.adminUser,
            type: 'credits_issued',
            title: 'Credits Issued',
            message: `Government has issued ${credits} credits to your account. Wallet balance updated.`
        });

        sendToUser(company.adminUser, {
            type: 'credits_issued',
            message: 'Credits added to wallet'
        });

        res.status(201).json({ success: true, message: 'Credits issued successfully', data: issuance });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET ALL COMPANIES (Gov view)
 * =========================== */
exports.getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find()
            .populate('adminUser', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GOV DASHBOARD STATS
 * =========================== */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalCompanies = await Company.countDocuments();
        const nonCompliant = await Company.countDocuments({ complianceStatus: 'non-compliant' });
        const pendingReports = await EmissionEntry.countDocuments({ status: 'pending' });

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const issuedThisMonthQuery = await CreditIssuance.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$credits' } } }
        ]);
        const creditsIssuedThisMonth = issuedThisMonthQuery[0] ? issuedThisMonthQuery[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalCompanies,
                pendingReports,
                creditsIssuedThisMonth,
                nonCompliantCompanies: nonCompliant
            }
        });
    } catch (error) {
        next(error);
    }
};
