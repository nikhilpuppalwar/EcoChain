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
const { logBlockchainEvent } = require('../utils/ledger');

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
 * REVIEW AI ANOMALY
 * =========================== */
exports.reviewAnomaly = async (req, res, next) => {
    try {
        const { action, reason } = req.body;
        
        if (!['override', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Must be override or reject.' });
        }

        if (action === 'reject' && !reason) {
            return res.status(400).json({ success: false, message: 'Reason is required for rejecting a flagged report' });
        }

        const report = await EmissionEntry.findById(req.params.id).populate('company');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        if (report.status !== 'ai_flagged') {
            return res.status(400).json({ success: false, message: `Cannot review anomaly. Report is currently ${report.status}` });
        }

        if (action === 'override') {
            // Government determines the AI was overly cautious; proceed to manual auditor assignment flow
            report.status = 'pending_govt_assignment';
            report.notes += `\n[Govt Anomaly Override]: Approved for auditor assignment by ${req.user._id}`;
            await report.save();

            // Log activity
            await ReportReview.create({
                report: report._id,
                reviewedBy: req.user._id,
                action: 'approved', // Internal status for the override action
                reason: 'Anomaly Overridden - Sent to Assignment Queue'
            });

            res.status(200).json({ success: true, message: 'Anomaly overridden. Report moved to assignment queue.', data: report });
        } else {
            // Government agrees with AI; reject the report back to the industry
            report.status = 'rejected';
            report.rejectionReason = `AI Anomaly Confirmed: ${reason}`;
            report.reviewedBy = req.user._id;
            report.reviewedAt = Date.now();
            await report.save();

            // Log activity
            await ReportReview.create({
                report: report._id,
                reviewedBy: req.user._id,
                action: 'rejected',
                reason: `AI Anomaly Confirmed: ${reason}`
            });

            // Notify
            await Notification.create({
                user: report.company.adminUser,
                type: 'report_rejected',
                title: 'Submission Rejected (Anomaly)',
                message: `Your emission report was rejected due to confirmed data anomalies: ${reason}`
            });

            res.status(200).json({ success: true, message: 'Report rejected due to anomalies.', data: report });
        }
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * ISSUE OR REVOKE CREDITS
 * =========================== */
exports.issueCredits = async (req, res, next) => {
    try {
        const { submissionId, credits, actionType = 'ISSUE', reason, validityDate } = req.body;

        const submission = await EmissionEntry.findById(submissionId).populate('company');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        const company = submission.company;
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found for this submission' });
        }

        // 1. Prepare IPFS Metadata JSON and pin it
        const metadata = {
            description: `Carbon Credits ${actionType === 'ISSUE' ? 'Issued' : 'Revoked'} by EcoChain Gov`,
            attributes: [
                { trait_type: "Company", value: company.name },
                { trait_type: "Amount", value: credits },
                { trait_type: "Action", value: actionType },
                { trait_type: "Reason", value: reason },
                { trait_type: "Date", value: new Date().toISOString() },
                { trait_type: "Validity Document", value: validityDate }
            ]
        };

        const metadataCID = await pinataUtil.uploadJSON(metadata, `${actionType}_${company.name}_${Date.now()}`);

        // 2. Transact on Blockchain (Mocked or Real)
        let txHash;
        try {
            if (actionType === 'ISSUE') {
                txHash = await issueCreditsOnChain(company.walletAddress || "0x_MOCK", credits, reason, metadataCID);
            } else {
                // Mocking revoke on-chain if contract doesn't support revoke
                txHash = `0x_revoke_${Date.now()}`;
            }
        } catch (e) {
            console.error("Blockchain error, falling back to mock tx", e);
            txHash = `0x_mock_${actionType.toLowerCase()}_${Date.now()}`;
        }

        // 3. Create issuance/revocation record
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
        if (actionType === 'ISSUE') {
            company.creditBalance += parseInt(credits);
        } else {
            company.creditBalance = Math.max(0, company.creditBalance - parseInt(credits));
        }
        await company.save();

        // 5. Build CreditTransaction record
        await CreditTransaction.create({
            toCompany: company._id,
            credits,
            type: actionType === 'ISSUE' ? 'issuance' : 'revocation',
            txHash
        });

        // 6. Update Submission Status and log Audit to Blockchain
        try {
            const auditReport = await ReportReview.findOne({ report: submission._id });
            const { storeAuditReport } = require('../utils/blockchain');
            if (auditReport) {
                const reportTxHash = await storeAuditReport(submission, auditReport);
                submission.notes += `\n[Blockchain Verified]: TX ${reportTxHash}`;
            }
        } catch (err) {
            console.error("Failed to store audit to blockchain:", err);
        }

        submission.status = 'approved';
        submission.notes += `\n[Credits ${actionType === 'ISSUE' ? 'Issued' : 'Revoked'}]: ${credits} CCR. TX ${txHash}`;
        await submission.save();

        // Log event to the decentralized ledger (non-blocking)
        logBlockchainEvent({
            eventType: actionType === 'ISSUE' ? 'MINT' : 'BURN',
            submission,
            company,
            details: `Government ${actionType === 'ISSUE' ? 'issued' : 'revoked'} ${credits} CCR tokens to ${company.name}.`,
            actor: 'government',
            txHash
        });

        // 7. Notify Company
        await Notification.create({
            user: company.adminUser,
            type: actionType === 'ISSUE' ? 'credits_issued' : 'credits_revoked',
            title: `Credits ${actionType === 'ISSUE' ? 'Issued' : 'Revoked'}`,
            message: `Government has reviewed your report and ${actionType === 'ISSUE' ? 'issued' : 'revoked/burned'} ${credits} credits.`
        });

        sendToUser(company.adminUser, {
            type: 'credits_updated',
            message: `Credits ${actionType === 'ISSUE' ? 'added to' : 'removed from'} wallet`
        });

        res.status(201).json({ success: true, message: `Credits ${actionType.toLowerCase()}d successfully`, data: issuance });
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
        
        // Count pending reports (all stages requiring action)
        const pendingReports = await EmissionEntry.countDocuments({ 
            status: { $in: ['pending', 'submitted', 'pending_govt_assignment', 'ai_flagged'] } 
        });

        // Sum of all credits ever issued
        const totalCreditsQuery = await CreditIssuance.aggregate([
            { $group: { _id: null, total: { $sum: '$credits' } } }
        ]);
        const creditsIssued = totalCreditsQuery[0] ? totalCreditsQuery[0].total : 0;

        // Calculate compliance rate
        const complianceRate = totalCompanies > 0 
            ? Math.round(((totalCompanies - nonCompliant) / totalCompanies) * 100) 
            : 100;

        // Fetch actual pending actions for Priority Queue
        // Get up to 3 pending company registrations
        const pendingRegistrations = await Company.find({ verificationStatus: 'pending' })
            .select('name createdAt')
            .limit(3);

        // Get up to 3 pending reports
        const pendingReportsList = await EmissionEntry.find({ 
            status: { $in: ['pending', 'submitted', 'pending_govt_assignment', 'ai_flagged'] } 
        })
            .populate('company', 'name')
            .sort({ createdAt: -1 })
            .limit(3);

        const pendingActions = [];
        const getRelativeTimeString = (date) => {
            const delta = Math.round((+new Date() - date) / 1000);
            const minute = 60, hour = minute * 60, day = hour * 24;
            if (delta < 30) return 'just now';
            if (delta < minute) return delta + ' seconds ago';
            if (delta < 2 * minute) return 'a minute ago';
            if (delta < hour) return Math.floor(delta / minute) + ' minutes ago';
            if (delta < 2 * hour) return 'an hour ago';
            if (delta < day) return Math.floor(delta / hour) + ' hours ago';
            if (delta < 2 * day) return 'yesterday';
            return Math.floor(delta / day) + ' days ago';
        };

        pendingRegistrations.forEach(r => {
            pendingActions.push({
                id: r._id.toString(),
                type: 'registration',
                company: r.name,
                submitted: getRelativeTimeString(r.createdAt)
            });
        });
        pendingReportsList.forEach(r => {
            pendingActions.push({
                id: r._id.toString(),
                type: 'emission_report',
                company: r.company?.name || 'Unknown Company',
                submitted: getRelativeTimeString(r.createdAt)
            });
        });

        // National Emissions Trend (aggregate quantityTonnes by month for the current year)
        const currentYear = new Date().getFullYear();
        const monthlyEmissions = await EmissionEntry.aggregate([
            { $match: { periodYear: currentYear, status: 'approved' } },
            { 
                $group: { 
                    _id: '$periodMonth', 
                    value: { $sum: '$quantityTonnes' } 
                } 
            }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const nationalEmissionsData = months.map((m, index) => {
            const matched = monthlyEmissions.find(me => {
                const monthVal = me._id;
                if (typeof monthVal === 'string') {
                    return monthVal.toLowerCase().substring(0, 3) === m.toLowerCase();
                }
                return monthVal === (index + 1);
            });
            return {
                name: m,
                value: matched ? matched.value : 0,
                target: 800000 - (index * 5000)
            };
        });

        // AI Forecast
        const currentMonthIndex = new Date().getMonth();
        const aiForecast = months.map((m, index) => {
            const emissionValue = nationalEmissionsData[index].value;
            if (index <= currentMonthIndex) {
                return {
                    month: m,
                    actual: emissionValue > 0 ? emissionValue : 800000 - (index * 15000) + Math.round(Math.random() * 20000)
                };
            } else {
                return {
                    month: m,
                    forecast: 800000 - (index * 15000) - Math.round(Math.random() * 10000)
                };
            }
        });

        // Sector Compliance Rates
        const sectorData = await Company.aggregate([
            {
                $group: {
                    _id: '$sector',
                    total: { $sum: 1 },
                    compliant: { 
                        $sum: { 
                            $cond: [ { $eq: ['$complianceStatus', 'compliant'] }, 1, 0 ] 
                        } 
                    }
                }
            }
        ]);

        const sectorCompliance = sectorData
            .filter(s => s._id)
            .map(s => {
                const sectorName = s._id;
                const rate = s.total > 0 ? Math.round((s.compliant / s.total) * 100) : 100;
                return {
                    sector: sectorName,
                    rate,
                    target: 95
                };
            });

        // Ensure default sectors if empty
        if (sectorCompliance.length === 0) {
            sectorCompliance.push(
                { sector: 'Manufacturing', rate: 91, target: 95 },
                { sector: 'Energy', rate: 78, target: 95 },
                { sector: 'Transport', rate: 88, target: 90 },
                { sector: 'Agriculture', rate: 96, target: 90 },
                { sector: 'Construction', rate: 72, target: 90 },
                { sector: 'Mining', rate: 83, target: 95 }
            );
        }

        res.status(200).json({
            success: true,
            data: {
                totalRegistered: totalCompanies,
                pendingReports,
                creditsIssued,
                complianceRate,
                pendingActions: pendingActions.slice(0, 5),
                nationalEmissionsData,
                aiForecast,
                sectorCompliance
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GOV ANALYTICS DATA
 * =========================== */
exports.getAnalyticsData = async (req, res, next) => {
    try {
        const AnomalyReport = require('../models/AnomalyReport');

        // Flagged Submissions (RED or YELLOW)
        const flaggedReports = await AnomalyReport.find({ isFlagged: true })
            .populate({ path: 'submission', populate: { path: 'company', select: 'name sector' } })
            .sort({ finalRiskScore: -1 })
            .limit(20);

        const flaggedSubmissions = flaggedReports
            .filter(r => r.submission && r.submission.company)
            .map(r => ({
                id: r.submission._id,
                company: r.submission.company?.name || 'Unknown',
                sector: r.submission.company?.sector || 'General',
                period: `${r.submission.periodMonth}/${r.submission.periodYear}`,
                riskScore: r.finalRiskScore,
                reason: r.explanation || 'Anomaly detected in emission data',
                status: r.governmentReviewStatus === 'reviewed' ? 'Reviewed' :
                        r.governmentReviewStatus === 'escalated' ? 'Escalated' : 'Under Review'
            }));

        // AI Stats
        const total = await AnomalyReport.countDocuments();
        const flaggedCount = await AnomalyReport.countDocuments({ isFlagged: true });
        const highRisk = await AnomalyReport.countDocuments({ finalRiskScore: { $gte: 80 }, riskFlag: 'RED' });

        // Top polluter companies by total emissions
        const topPolluters = await EmissionEntry.aggregate([
            { $group: { _id: '$company', totalCO2: { $sum: '$quantityTonnes' } } },
            { $sort: { totalCO2: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyData' } },
            { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ['$companyData.name', 'Unknown'] }, co2: '$totalCO2' } }
        ]);

        // Sector breakdown
        const sectorData = await EmissionEntry.aggregate([
            { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'companyData' } },
            { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
            { $group: { _id: { sector: '$companyData.sector', month: '$periodMonth' }, totalCO2: { $sum: '$quantityTonnes' } } },
            { $sort: { '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                flaggedSubmissions,
                aiStats: { total, flaggedCount, highRisk, pctFlagged: total > 0 ? ((flaggedCount / total) * 100).toFixed(1) : '0' },
                topPolluters,
                sectorData
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET VERIFICATION REQUESTS
 * =========================== */
exports.getVerificationRequests = async (req, res, next) => {
    try {
        // Find industries pending verification
        const pendingCompanies = await Company.find({ verificationStatus: 'pending' }).populate('adminUser', 'email');
        
        // Find auditors pending verification
        const pendingAuditors = await User.find({
            role: 'auditor',
            'auditorProfile.status': 'pending'
        });

        res.status(200).json({
            success: true,
            data: {
                companies: pendingCompanies,
                auditors: pendingAuditors
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * VERIFY INDUSTRY
 * =========================== */
exports.verifyIndustry = async (req, res, next) => {
    try {
        const { action, reason } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
        }

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        company.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
        if (action === 'reject') {
            company.rejectionReason = reason || 'Verification documents incorrect or incomplete.';
        } else {
            company.rejectionReason = undefined;
        }
        await company.save();

        if (company.adminUser) {
            const user = await User.findById(company.adminUser);
            if (user) {
                user.isActive = action === 'approve';
                await user.save();
            }
        }

        if (company.adminUser) {
            await Notification.create({
                user: company.adminUser,
                type: action === 'approve' ? 'onboarding_completed' : 'onboarding_failed',
                title: action === 'approve' ? 'Registration Approved' : 'Registration Rejected',
                message: action === 'approve' 
                    ? 'Your industry account has been successfully verified. You can now login to your dashboard.' 
                    : `Your industry account registration was rejected by the regulator. Reason: ${reason || 'Incomplete details'}`
            });
        }

        res.status(200).json({
            success: true,
            message: `Industry ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * SUSPEND INDUSTRY
 * =========================== */
exports.suspendIndustry = async (req, res, next) => {
    try {
        const { action } = req.body;
        if (!['suspend', 'unsuspend'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Must be suspend or unsuspend.' });
        }

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        company.verificationStatus = action === 'suspend' ? 'suspended' : 'approved';
        await company.save();

        if (company.adminUser) {
            const user = await User.findById(company.adminUser);
            if (user) {
                user.isActive = action === 'unsuspend';
                await user.save();
            }
        }

        await Notification.create({
            user: company.adminUser || company._id,
            type: 'system_alert',
            title: action === 'suspend' ? 'Account Suspended' : 'Account Re-activated',
            message: action === 'suspend'
                ? 'Your industry account has been suspended by the regulator.'
                : 'Your industry account has been re-activated by the regulator.'
        });

        res.status(200).json({
            success: true,
            message: `Industry ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully.`
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * VERIFY AUDITOR
 * =========================== */
exports.verifyAuditor = async (req, res, next) => {
    try {
        const { action, reason } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
        }

        const auditor = await User.findOne({ _id: req.params.id, role: 'auditor' });
        if (!auditor) {
            return res.status(404).json({ success: false, message: 'Auditor not found' });
        }

        auditor.auditorProfile.status = action === 'approve' ? 'approved' : 'rejected';
        auditor.isActive = action === 'approve';
        if (action === 'reject') {
            auditor.auditorProfile.rejectionReason = reason || 'Certification documents could not be verified.';
        } else {
            auditor.auditorProfile.rejectionReason = undefined;
        }
        await auditor.save();

        await Notification.create({
            user: auditor._id,
            type: action === 'approve' ? 'onboarding_completed' : 'onboarding_failed',
            title: action === 'approve' ? 'Application Approved' : 'Application Rejected',
            message: action === 'approve' 
                ? 'Your auditor application has been approved. You can now sign in and perform audits.' 
                : `Your auditor application was rejected by the regulator. Reason: ${reason || 'Incomplete details'}`
        });

        res.status(200).json({
            success: true,
            message: `Auditor application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * SUSPEND AUDITOR
 * =========================== */
exports.suspendAuditor = async (req, res, next) => {
    try {
        const { action } = req.body;
        if (!['suspend', 'unsuspend'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Must be suspend or unsuspend.' });
        }

        const auditor = await User.findOne({ _id: req.params.id, role: 'auditor' });
        if (!auditor) {
            return res.status(404).json({ success: false, message: 'Auditor not found' });
        }

        auditor.isActive = action === 'unsuspend';
        auditor.auditorProfile.status = action === 'unsuspend' ? 'approved' : 'rejected';
        await auditor.save();

        await Notification.create({
            user: auditor._id,
            type: 'system_alert',
            title: action === 'suspend' ? 'Account Suspended' : 'Account Re-activated',
            message: action === 'suspend'
                ? 'Your auditor account has been suspended by the regulator due to policy compliance review.'
                : 'Your auditor account has been re-activated by the regulator.'
        });

        res.status(200).json({
            success: true,
            message: `Auditor ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully.`
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET REGISTRY RECORDS
 * =========================== */
exports.getRegistryRecords = async (req, res, next) => {
    try {
        const issuances = await CreditIssuance.find()
            .populate('company', 'name walletAddress sector')
            .populate('issuedBy', 'email')
            .sort({ createdAt: -1 });

        const transactions = await CreditTransaction.find()
            .populate('fromCompany', 'name walletAddress')
            .populate('toCompany', 'name walletAddress')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                issuances,
                transactions
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET COMPLIANCE DATA
 * =========================== */
exports.getComplianceData = async (req, res, next) => {
    try {
        const companies = await Company.find({ verificationStatus: 'approved' });
        const currentYear = new Date().getFullYear();

        const data = await Promise.all(companies.map(async (company) => {
            const emissions = await EmissionEntry.find({
                company: company._id,
                status: 'approved'
            });

            const totalEmissions = emissions.reduce((sum, e) => sum + (e.quantityTonnes || 0), 0);
            const creditsPurchased = company.creditBalance || 0;
            const netEmissions = Math.max(0, totalEmissions - creditsPurchased);
            const cap = company.annualCarbonBudget || 10000;

            let status = 'Compliant';
            if (netEmissions > cap) {
                status = 'Non-compliant';
            } else if (netEmissions > cap * 0.9) {
                status = 'At Risk';
            }

            const penalty = company.penalty || 0;

            return {
                id: company._id.toString(),
                name: company.name,
                sector: company.sector,
                status,
                emissions: totalEmissions,
                cap,
                creditsPurchased,
                penalty
            };
        }));

        // Dynamic Sector Analysis aggregation
        const sectorMap = {};
        data.forEach(c => {
            const sec = c.sector || 'Other';
            if (!sectorMap[sec]) {
                sectorMap[sec] = { name: sec, emissions: 0, target: 0 };
            }
            sectorMap[sec].emissions += c.emissions;
            sectorMap[sec].target += c.cap;
        });

        // Ensure default sectors are present with some values if empty
        const defaultSectors = ['Energy', 'Cement', 'Steel', 'Mining', 'Transport', 'Other'];
        defaultSectors.forEach(sec => {
            if (!sectorMap[sec]) {
                sectorMap[sec] = { name: sec, emissions: 0, target: 10000 }; // small default cap
            }
        });

        const sectorData = Object.values(sectorMap);

        res.status(200).json({
            success: true,
            data: {
                companies: data,
                sectorData
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * ISSUE PENALTY
 * =========================== */
exports.issuePenalty = async (req, res, next) => {
    try {
        const { companyId, penaltyAmount, reason } = req.body;

        if (!companyId || !penaltyAmount || penaltyAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid penalty parameters' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        company.penalty = (company.penalty || 0) + Number(penaltyAmount);
        await company.save();

        if (company.adminUser) {
            await Notification.create({
                user: company.adminUser,
                type: 'system_alert',
                title: 'Compliance Penalty Issued',
                message: `An official compliance penalty of ₹${Number(penaltyAmount).toLocaleString()} has been assessed to your organization. Reason: ${reason || 'Non-compliance with allocated carbon budget.'}`
            });

            sendToUser(company.adminUser, {
                type: 'penalty_issued',
                penalty: company.penalty,
                message: `Compliance penalty issued: ₹${Number(penaltyAmount).toLocaleString()}`
            });
        }

        res.status(200).json({
            success: true,
            message: `Penalty of ₹${Number(penaltyAmount).toLocaleString()} successfully issued to ${company.name}.`,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * BATCH ISSUE PENALTIES
 * =========================== */
exports.issueBatchPenalties = async (req, res, next) => {
    try {
        const { penaltyAmount, reason } = req.body;

        if (!penaltyAmount || penaltyAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid penalty amount' });
        }

        const companies = await Company.find({ verificationStatus: 'approved' });
        let penalizedCount = 0;

        for (const company of companies) {
            const emissions = await EmissionEntry.find({
                company: company._id,
                status: 'approved'
            });

            const totalEmissions = emissions.reduce((sum, e) => sum + (e.quantityTonnes || 0), 0);
            const creditsPurchased = company.creditBalance || 0;
            const netEmissions = Math.max(0, totalEmissions - creditsPurchased);
            const cap = company.annualCarbonBudget || 10000;

            if (netEmissions > cap) {
                company.penalty = (company.penalty || 0) + Number(penaltyAmount);
                await company.save();

                if (company.adminUser) {
                    await Notification.create({
                        user: company.adminUser,
                        type: 'system_alert',
                        title: 'Compliance Penalty Issued (Batch Assessment)',
                        message: `An official compliance penalty of ₹${Number(penaltyAmount).toLocaleString()} has been assessed to your organization via batch enforcement. Reason: ${reason || 'Non-compliance with carbon cap.'}`
                    });

                    sendToUser(company.adminUser, {
                        type: 'penalty_issued',
                        penalty: company.penalty,
                        message: `Compliance penalty issued: ₹${Number(penaltyAmount).toLocaleString()}`
                    });
                }

                penalizedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully issued ₹${Number(penaltyAmount).toLocaleString()} penalties to ${penalizedCount} non-compliant organizations.`,
            penalizedCount
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * COMBINED MONITORING & ANALYTICS
 * =========================== */
exports.getMonitoringAnalytics = async (req, res, next) => {
    try {
        const AnomalyReport = require('../models/AnomalyReport');

        // --- Industries ---
        const companies = await Company.find({ verificationStatus: 'approved' })
            .populate('adminUser', 'email')
            .sort({ createdAt: -1 });

        const industryList = await Promise.all(companies.map(async (c) => {
            const emissions = await EmissionEntry.find({ company: c._id, status: 'approved' });
            const totalEmissions = emissions.reduce((s, e) => s + (e.quantityTonnes || 0), 0);
            const netEmissions = Math.max(0, totalEmissions - (c.creditBalance || 0));
            const cap = c.annualCarbonBudget || 10000;
            let complianceStatus = 'Compliant';
            if (netEmissions > cap) complianceStatus = 'Non-compliant';
            else if (netEmissions > cap * 0.9) complianceStatus = 'At Risk';
            return {
                id: c._id,
                name: c.name,
                sector: c.sector || 'General',
                region: c.state || 'N/A',
                totalEmissions: Math.round(totalEmissions),
                creditBalance: c.creditBalance || 0,
                netEmissions: Math.round(netEmissions),
                cap,
                complianceStatus,
                penalty: c.penalty || 0,
                adminEmail: c.adminUser?.email || 'N/A',
                registrationNo: c.registrationNo || 'N/A',
                verificationStatus: c.verificationStatus,
            };
        }));

        // --- Auditors ---
        const auditors = await User.find({ role: 'auditor', 'auditorProfile.status': 'approved' })
            .select('email auditorProfile')
            .sort({ createdAt: -1 });

        const auditorList = auditors.map(a => ({
            id: a._id,
            name: a.auditorProfile?.fullName || a.email,
            organization: a.auditorProfile?.organization || 'Independent',
            specialization: a.auditorProfile?.specialization || 'General',
            licenseNumber: a.auditorProfile?.licenseNumber || 'N/A',
            experience: a.auditorProfile?.experience || '—',
            status: a.auditorProfile?.status || 'approved',
            email: a.email,
        }));

        // --- Top Polluters ---
        const topPolluters = await EmissionEntry.aggregate([
            { $group: { _id: '$company', totalCO2: { $sum: '$quantityTonnes' } } },
            { $sort: { totalCO2: -1 } },
            { $limit: 8 },
            { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyData' } },
            { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ['$companyData.name', 'Unknown'] }, co2: '$totalCO2', sector: { $ifNull: ['$companyData.sector', 'General'] } } }
        ]);

        // --- Sector Aggregation ---
        const sectorAgg = await EmissionEntry.aggregate([
            { $match: { status: 'approved' } },
            { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'companyData' } },
            { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
            { $group: { _id: '$companyData.sector', totalEmissions: { $sum: '$quantityTonnes' }, count: { $sum: 1 } } },
            { $sort: { totalEmissions: -1 } }
        ]);

        const sectorData = sectorAgg
            .filter(s => s._id)
            .map(s => ({ sector: s._id || 'Unknown', emissions: Math.round(s.totalEmissions), count: s.count }));

        // --- AI Flags ---
        const flaggedReports = await AnomalyReport.find({ isFlagged: true })
            .populate({ path: 'submission', populate: { path: 'company', select: 'name sector' } })
            .sort({ finalRiskScore: -1 })
            .limit(10);

        const flaggedSubmissions = flaggedReports
            .filter(r => r.submission && r.submission.company)
            .map(r => ({
                id: r.submission._id,
                company: r.submission.company?.name || 'Unknown',
                sector: r.submission.company?.sector || 'General',
                period: `${r.submission.periodMonth}/${r.submission.periodYear}`,
                riskScore: r.finalRiskScore,
                reason: r.explanation || 'Anomaly detected',
                status: r.governmentReviewStatus === 'reviewed' ? 'Reviewed' : r.governmentReviewStatus === 'escalated' ? 'Escalated' : 'Under Review'
            }));

        const totalAI = await AnomalyReport.countDocuments();
        const flaggedCount = await AnomalyReport.countDocuments({ isFlagged: true });
        const highRisk = await AnomalyReport.countDocuments({ finalRiskScore: { $gte: 80 }, riskFlag: 'RED' });

        // --- Summary Stats ---
        const nonCompliant = industryList.filter(i => i.complianceStatus === 'Non-compliant').length;
        const atRisk = industryList.filter(i => i.complianceStatus === 'At Risk').length;

        res.status(200).json({
            success: true,
            data: {
                industries: industryList,
                auditors: auditorList,
                topPolluters,
                sectorData,
                flaggedSubmissions,
                aiStats: {
                    total: totalAI,
                    flaggedCount,
                    highRisk,
                    pctFlagged: totalAI > 0 ? ((flaggedCount / totalAI) * 100).toFixed(1) : '0'
                },
                summary: {
                    totalIndustries: industryList.length,
                    totalAuditors: auditorList.length,
                    nonCompliant,
                    atRisk,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * MODIFY PENALTY
 * =========================== */
exports.modifyPenalty = async (req, res, next) => {
    try {
        const { companyId, penaltyAmount, reason } = req.body;

        if (!companyId || penaltyAmount === undefined || Number(penaltyAmount) < 0) {
            return res.status(400).json({ success: false, message: 'Invalid penalty modification parameters' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const oldPenalty = company.penalty || 0;
        company.penalty = Number(penaltyAmount);
        await company.save();

        if (company.adminUser) {
            await Notification.create({
                user: company.adminUser,
                type: 'system_alert',
                title: 'Compliance Penalty Modified',
                message: `Your compliance penalty has been adjusted from ₹${oldPenalty.toLocaleString()} to ₹${Number(penaltyAmount).toLocaleString()}. Reason: ${reason || 'Administrative adjustment.'}`
            });

            sendToUser(company.adminUser, {
                type: 'penalty_modified',
                penalty: company.penalty,
                message: `Your compliance penalty has been modified to ₹${Number(penaltyAmount).toLocaleString()}`
            });
        }

        res.status(200).json({
            success: true,
            message: `Penalty successfully modified to ₹${Number(penaltyAmount).toLocaleString()} for ${company.name}.`,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CLEAR PENALTY (SET TO ZERO)
 * =========================== */
exports.clearPenalty = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const oldPenalty = company.penalty || 0;
        company.penalty = 0;
        await company.save();

        if (company.adminUser) {
            await Notification.create({
                user: company.adminUser,
                type: 'system_alert',
                title: 'Compliance Penalty Cleared',
                message: `Your compliance penalty of ₹${oldPenalty.toLocaleString()} has been fully waived/cleared by the regulator.`
            });

            sendToUser(company.adminUser, {
                type: 'penalty_cleared',
                penalty: 0,
                message: 'Your compliance penalty has been waived/cleared.'
            });
        }

        res.status(200).json({
            success: true,
            message: `Penalty has been successfully cleared/waived for ${company.name}.`,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

