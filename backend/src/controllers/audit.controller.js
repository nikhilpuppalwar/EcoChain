const EmissionEntry = require('../models/EmissionEntry');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { broadcastToRole } = require('../utils/websocket');
const { generateBRSRReport } = require('../utils/reportGenerator');
// const emailService = require('../services/email.service'); // Optional inclusion later if needed

exports.assignAuditors = async (req, res, next) => {
    try {
        const { submissionId, auditorIds, auditType, notes } = req.body;

        // 1. Validate submission exists and is in 'pending_govt_assignment' status
        const submission = await EmissionEntry.findById(submissionId);
        if (!submission || submission.status !== 'pending_govt_assignment') {
            return res.status(400).json({ success: false, message: 'Submission not available for assignment' });
        }

        // 2. Validate auditorIds
        if (auditType === 'single' && auditorIds.length !== 1) {
            return res.status(400).json({ success: false, message: 'Single audit requires exactly 1 auditor' });
        }
        if (auditType === 'dual' && auditorIds.length !== 2) {
            return res.status(400).json({ success: false, message: 'Dual audit requires exactly 2 auditors' });
        }

        // 3. Update emission_submissions
        await EmissionEntry.findByIdAndUpdate(submissionId, {
            assignedAuditors: auditorIds,
            auditType,
            status: 'pending_audit',
            assignedByGovtId: req.user._id,
            assignedByGovtAt: new Date()
        });

        // 4. Update each auditor's currentAssignments array and Notify
        const notifications = [];
        for (const [index, auditorId] of auditorIds.entries()) {
            const role = auditType === 'dual' ? (index === 0 ? 'primary' : 'secondary') : 'primary';
            
            await User.findByIdAndUpdate(auditorId, {
                $push: {
                    'auditorProfile.currentAssignments': {
                        submissionId,
                        industryId: submission.company,
                        role: role,
                        assignedAt: new Date()
                    }
                }
            });

            // Prepare notification document
            notifications.push({
                user: auditorId,
                type: 'auditor_assigned',
                title: 'New Audit Assignment',
                message: `You have been assigned to audit a new submission. Role: ${role}`
            });

            // Real-time broadcast
            // io.to(`auditor:${auditorId}`).emit('audit:assigned', {...}); // Example placeholder
        }

        // Notify industry
        notifications.push({
            user: submission.company, // Assumes company owner receives notifications, or find specific user
            type: 'auditor_assigned',
            title: 'Auditor Assigned',
            message: `The government has assigned ${auditorIds.length === 2 ? '2 auditors' : 'an auditor'} to review your emission submission.`
        });

        await Notification.insertMany(notifications);

        return res.status(200).json({ success: true, message: 'Auditor(s) assigned successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getAuditQueue = async (req, res, next) => {
    try {
        // Find submissions where this auditor is assigned and status implies action is needed
        const queue = await EmissionEntry.find({
            assignedAuditors: req.user._id,
            status: { $in: ['pending_audit', 'awaiting_second_auditor', 'under_review'] }
        }).populate('company', 'name'); // Example population

        res.status(200).json({ success: true, count: queue.length, data: queue });
    } catch (error) {
        next(error);
    }
};

const ReportReview = require('../models/ReportReview');

exports.verifySubmission = async (req, res, next) => {
    try {
        const { submissionId, decision, remarks, digitalSignature, documentChecklist, correctionRequired } = req.body;

        const submission = await EmissionEntry.findById(submissionId).populate('assignedAuditors');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        let auditReport = await ReportReview.findOne({ report: submissionId });
        if (!auditReport) {
            auditReport = new ReportReview({ report: submissionId });
        }

        // Determine Role
        const auditorIndex = submission.assignedAuditors.findIndex(a => a._id.toString() === req.user._id.toString());
        if (auditorIndex === -1) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this audit' });
        }
        const role = submission.auditType === 'dual' ? (auditorIndex === 0 ? 'primary' : 'secondary') : 'primary';

        // Add this auditor's review to the auditors array
        auditReport.auditors.push({
            auditorId: req.user._id,
            role: role,
            decision,
            remarks,
            digitalSignature,
            signedAt: new Date()
        });
        
        if (documentChecklist) {
            auditReport.documentChecklist = documentChecklist;
        }

        if (decision === 'correction_requested' && correctionRequired) {
            auditReport.correctionRequired = correctionRequired;
        }

        // Single audit → finalise immediately
        if (submission.auditType === 'single') {
            auditReport.finalDecision = decision;
            auditReport.finalDecisionAt = new Date();
            await finaliseAuditDecision(submission, auditReport, decision);
        }

        // Dual audit → check if both have signed
        if (submission.auditType === 'dual') {
            if (auditReport.auditors.length === 1) {
                // First auditor signed — wait for second
                submission.status = 'awaiting_second_auditor';
                await submission.save();
                
                // Notify second auditor
                const secondAuditor = submission.assignedAuditors.find(a => a._id.toString() !== req.user._id.toString());
                if (secondAuditor) {
                    await Notification.create({
                        user: secondAuditor._id,
                        type: 'awaiting_second_auditor',
                        title: 'Second Signature Required',
                        message: `The first auditor has submitted their decision (${decision}). Your signature is now required.`
                    });
                    // Real-time
                    // io.to(`auditor:${secondAuditor._id}`).emit('audit:second_signature_required', {...});
                }
            } else if (auditReport.auditors.length === 2) {
                // Both signed — compute final decision
                const decisions = auditReport.auditors.map(a => a.decision);
                let finalDecision = 'approved';
                if (decisions.includes('rejected')) finalDecision = 'rejected';
                else if (decisions.includes('correction_requested')) finalDecision = 'correction_requested';

                auditReport.finalDecision = finalDecision;
                auditReport.finalDecisionAt = new Date();
                await finaliseAuditDecision(submission, auditReport, finalDecision);
            }
        }

        await auditReport.save();
        return res.status(200).json({ success: true, message: 'Audit decision submitted' });
    } catch (error) {
        next(error);
    }
};

async function finaliseAuditDecision(submission, auditReport, decision) {
    if (decision === 'approved') {
        submission.status = 'approved';
        await submission.save();

        // Notify industry
        await Notification.create({
            user: submission.company,
            type: 'report_approved',
            title: 'Report Approved',
            message: 'Your emission report has been fully approved by the auditor(s).'
        });
        
        // Generate BRSR report and append to the emission entry record
        const brsrReportUrl = await generateBRSRReport(submission, auditReport);
        
        // Add field dynamically or append to notes
        submission.notes += `\n[Generated BRSR]: ${brsrReportUrl}`;
        await submission.save();

        // await blockchain.storeAuditReport(submission, auditReport);
        // await calculateEmissionReduction(submission);

    } else if (decision === 'rejected') {
        submission.status = 'rejected';
        await submission.save();

        await Notification.create({
            user: submission.company,
            type: 'report_rejected',
            title: 'Report Rejected',
            message: 'Your emission report was rejected by the auditor(s).'
        });

    } else if (decision === 'correction_requested') {
        submission.status = 'correction_requested';
        await submission.save();
        
        await Notification.create({
            user: submission.company,
            type: 'correction_requested',
            title: 'Correction Requested',
            message: `The auditor requested corrections. Fields: ${auditReport.correctionRequired.fieldsToFix.join(', ')}`
        });
        
        // Emitting socket / emails logic would go here
    }
}
