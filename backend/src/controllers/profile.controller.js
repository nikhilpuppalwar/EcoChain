const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

/* ===========================
 * GET CURRENT USER PROFILE
 * GET /api/profile/me
 * Auth: all roles
 * =========================== */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
            .populate('company');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE INDUSTRY PROFILE (company + user fields)
 * PATCH /api/profile/industry
 * Auth: industry
 * =========================== */
exports.updateIndustryProfile = async (req, res, next) => {
    try {
        const { companyName, sector, state, registrationNo, taxId, annualCarbonBudget, walletAddress } = req.body;

        const company = await Company.findById(req.user.company);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        if (companyName)        company.name = companyName;
        if (sector)             company.sector = sector;
        if (state !== undefined) company.state = state;
        if (registrationNo !== undefined) company.registrationNo = registrationNo;
        if (taxId !== undefined) company.taxId = taxId;
        if (annualCarbonBudget !== undefined) company.annualCarbonBudget = Number(annualCarbonBudget);
        if (walletAddress !== undefined) company.walletAddress = walletAddress.trim();

        await company.save();

        // Re-fetch updated user with populated company
        const updated = await User.findById(req.user._id)
            .select('-password -refreshToken -resetPasswordToken')
            .populate('company');

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE GOVERNMENT PROFILE
 * PATCH /api/profile/government
 * Auth: government
 * =========================== */
exports.updateGovernmentProfile = async (req, res, next) => {
    try {
        const { officerName, designation, department, ministryName, jurisdiction, officialWebsite, officeAddress, serviceId } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (officerName   !== undefined) user.governmentProfile.officerName   = officerName;
        if (designation   !== undefined) user.governmentProfile.designation   = designation;
        if (department    !== undefined) user.governmentProfile.department    = department;
        if (ministryName  !== undefined) user.governmentProfile.ministryName  = ministryName;
        if (jurisdiction  !== undefined) user.governmentProfile.jurisdiction  = jurisdiction;
        if (officialWebsite !== undefined) user.governmentProfile.officialWebsite = officialWebsite;
        if (officeAddress !== undefined) user.governmentProfile.officeAddress = officeAddress;
        if (serviceId     !== undefined) user.governmentProfile.serviceId     = serviceId;

        await user.save();

        const updated = await User.findById(req.user._id)
            .select('-password -refreshToken -resetPasswordToken');

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE AUDITOR PROFILE
 * PATCH /api/profile/auditor
 * Auth: auditor
 * =========================== */
exports.updateAuditorProfile = async (req, res, next) => {
    try {
        const { name, organization, designation, licenseNumber, specialization, yearsExperience } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name            !== undefined) user.auditorProfile.name            = name;
        if (organization    !== undefined) user.auditorProfile.organization    = organization;
        if (designation     !== undefined) user.auditorProfile.designation     = designation;
        if (licenseNumber   !== undefined) user.auditorProfile.licenseNumber   = licenseNumber;
        if (yearsExperience !== undefined) user.auditorProfile.yearsExperience = Number(yearsExperience);
        if (specialization  !== undefined) user.auditorProfile.specialization  = Array.isArray(specialization) ? specialization : [specialization];

        await user.save();

        const updated = await User.findById(req.user._id)
            .select('-password -refreshToken -resetPasswordToken');

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE ADMIN PROFILE
 * PATCH /api/profile/admin
 * Auth: admin
 * =========================== */
exports.updateAdminProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name !== undefined) user.adminProfile.name = name;

        await user.save();

        const updated = await User.findById(req.user._id)
            .select('-password -refreshToken -resetPasswordToken');

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CHANGE PASSWORD (all roles)
 * PATCH /api/profile/change-password
 * Auth: all roles
 * =========================== */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * LINK WALLET ADDRESS (blockchain)
 * PATCH /api/profile/wallet
 * Auth: all roles (industry saves to Company, others save to user)
 * =========================== */
exports.linkWallet = async (req, res, next) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ success: false, message: 'walletAddress is required' });
        }

        // Basic Ethereum address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ success: false, message: 'Invalid Ethereum address format' });
        }

        let autoMinted = false;

        if (req.user.role === 'industry') {
            const company = await Company.findById(req.user.company);
            if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
            
            const cleanAddress = walletAddress.trim();
            const isNewWallet = !company.walletAddress || company.walletAddress.toLowerCase() !== cleanAddress.toLowerCase();
            
            company.walletAddress = cleanAddress;

            // In Hackathon Mode, auto-mint 5000 CCR to the wallet when linked for the first time
            if (process.env.HACKATHON_MODE === 'true' && isNewWallet) {
                const defaultAmount = 5000;
                console.log(`[HACKATHON] Auto-minting ${defaultAmount} CCR to newly linked wallet: ${cleanAddress}`);
                try {
                    const { issueCreditsOnChain } = require('../utils/blockchain');
                    const txHash = await issueCreditsOnChain(cleanAddress, defaultAmount, "Hackathon Auto-Seeding", "QmHackathonDemo");
                    company.creditBalance = (company.creditBalance || 0) + defaultAmount;
                    autoMinted = true;
                    console.log(`[HACKATHON] Auto-mint success! TX: ${txHash}`);
                } catch (blockchainErr) {
                    console.error("[HACKATHON] Failed to auto-mint credits:", blockchainErr.message);
                }
            }

            await company.save();
        } else {
            // Store wallet on user document for other roles
            const user = await User.findById(req.user._id);
            user.walletAddress = walletAddress.trim();
            await user.save();
        }

        res.status(200).json({ 
            success: true, 
            message: autoMinted 
                ? 'Wallet linked successfully and 5,000 CCR auto-minted!' 
                : 'Wallet linked successfully', 
            walletAddress,
            autoMinted
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET PROFILE STATS (role-specific summary)
 * GET /api/profile/stats
 * Auth: all roles
 * =========================== */
exports.getProfileStats = async (req, res, next) => {
    try {
        const role = req.user.role;
        let stats = {};

        if (role === 'industry') {
            const EmissionEntry = require('../models/EmissionEntry');
            const AiForecast = require('../models/AiForecast');
            const [emissions, forecasts] = await Promise.all([
                EmissionEntry.countDocuments({ company: req.user.company }),
                AiForecast.countDocuments({ company: req.user.company }),
            ]);
            stats = { totalSubmissions: emissions, totalForecasts: forecasts };
        }

        if (role === 'auditor') {
            const AnomalyReport = require('../models/AnomalyReport');
            const completed = await AnomalyReport.countDocuments({
                'submission': { $exists: true },
                'governmentReviewStatus': { $in: ['reviewed', 'escalated'] }
            });
            stats = {
                auditsCompleted: completed,
                activeAssignments: req.user.auditorProfile?.currentAssignments?.length || 0,
            };
        }

        if (role === 'government') {
            const EmissionEntry = require('../models/EmissionEntry');
            const CreditIssuance = require('../models/CreditIssuance');
            const [pending, credits] = await Promise.all([
                EmissionEntry.countDocuments({ status: 'pending_govt_assignment' }),
                CreditIssuance.countDocuments({}),
            ]);
            stats = { pendingReviews: pending, creditsIssued: credits };
        }

        if (role === 'admin') {
            const User = require('../models/User');
            const totalUsers = await User.countDocuments({});
            stats = { totalUsers, platform: 'EcoChain v1.0' };
        }

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * RESUBMIT INDUSTRY REGISTRATION
 * PATCH /api/profile/resubmit-industry
 * Auth: industry (when rejected)
 * =========================== */
exports.resubmitIndustryRegistration = async (req, res, next) => {
    try {
        const { companyName, sector, state, registrationNo, taxId, annualCarbonBudget } = req.body;

        const company = await Company.findById(req.user.company);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        // Update company fields
        if (companyName)        company.name = companyName;
        if (sector)             company.sector = sector;
        if (state !== undefined) company.state = state;
        if (registrationNo !== undefined) company.registrationNo = registrationNo;
        if (taxId !== undefined) company.taxId = taxId;
        if (annualCarbonBudget !== undefined) company.annualCarbonBudget = Number(annualCarbonBudget);

        // Reset status to pending so government admin can re-review
        company.verificationStatus = 'pending';
        company.rejectionReason = undefined;
        await company.save();

        // Ensure user is inactive until approved again
        const user = await User.findById(req.user._id);
        if (user) {
            user.isActive = false;
            await user.save();
        }

        res.status(200).json({ success: true, message: 'Registration resubmitted successfully for verification.' });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * RESUBMIT AUDITOR APPLICATION
 * PATCH /api/profile/resubmit-auditor
 * Auth: auditor (when rejected)
 * =========================== */
exports.resubmitAuditorApplication = async (req, res, next) => {
    try {
        const { name, organization, designation, licenseNumber, specialization, yearsExperience } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name            !== undefined) user.auditorProfile.name            = name;
        if (organization    !== undefined) user.auditorProfile.organization    = organization;
        if (designation     !== undefined) user.auditorProfile.designation     = designation;
        if (licenseNumber   !== undefined) user.auditorProfile.licenseNumber   = licenseNumber;
        if (yearsExperience !== undefined) user.auditorProfile.yearsExperience = Number(yearsExperience);
        if (specialization  !== undefined) user.auditorProfile.specialization  = Array.isArray(specialization) ? specialization : [specialization];

        // Reset status to pending
        user.auditorProfile.status = 'pending';
        user.auditorProfile.rejectionReason = undefined;
        user.isActive = false;
        await user.save();

        res.status(200).json({ success: true, message: 'Auditor application resubmitted successfully for verification.' });
    } catch (error) {
        next(error);
    }
};
