const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const hackathonMode = process.env.HACKATHON_MODE === 'true';

// Helpers for token generation
const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });

// Set HTTP-only cookie for refresh token
const setTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/* ===========================
 * INDUSTRY REGISTRATION
 * =========================== */
exports.registerIndustry = async (req, res, next) => {
    try {
        const {
            sector, companyName, state, registrationNo, taxId, annualCarbonBudget,
            fullName, designation, workEmail, employeeId, phoneNumber, password
        } = req.body;

        const userExists = await User.findOne({ email: workEmail.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const company = await Company.create({
            name: companyName,
            sector,
            state,
            registrationNo,
            taxId,
            annualCarbonBudget
        });

        const user = await User.create({
            email: workEmail.toLowerCase(),
            password: hashedPassword,
            role: 'industry',
            company: company._id,
            isActive: true, // Industry users active immediately
        });

        company.adminUser = user._id;
        await company.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: { id: user._id, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GOVERNMENT REGISTRATION
 * =========================== */
exports.registerGovernment = async (req, res, next) => {
    try {
        const {
            ministryName, department, jurisdiction, authorizationCode, officeAddress, officialWebsite,
            officerName, designation, officialEmail, serviceId, phoneNumber, password
        } = req.body;

        const userExists = await User.findOne({ email: officialEmail.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Validate email domain (.gov.in or .nic.in)
        if (!hackathonMode) {
            if (!officialEmail.toLowerCase().endsWith('.gov.in') && !officialEmail.toLowerCase().endsWith('.nic.in')) {
                return res.status(400).json({ success: false, message: 'Must use a valid .gov.in or .nic.in email address' });
            }
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // If file was uploaded via multer, this will be handled by IPFS later
        // For now we get Cid from req.file or bypass
        let identityDocumentCID = "PENDING_IPFS_UPLOAD";

        // TODO: Upload to pinata here if req.file exists

        const user = await User.create({
            email: officialEmail.toLowerCase(),
            password: hashedPassword,
            role: 'government',
            isActive: true, // Auto-approved for now (and in hackathon mode)
            governmentProfile: {
                ministryName,
                department,
                jurisdiction,
                officerName,
                designation,
                serviceId,
                officialWebsite,
                officeAddress,
                identityDocumentCID,
                status: 'approved'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Account auto-approved.',
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * AUDITOR REGISTRATION
 * =========================== */
exports.registerAuditor = async (req, res, next) => {
    try {
        const {
            organization, designation, experience, specialization,
            fullName, workEmail, password, licenseNumber
        } = req.body;

        const userExists = await User.findOne({ email: workEmail.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload to pinata/ipfs for license document if needed
        let identityDocumentCID = "PENDING_IPFS_UPLOAD";

        const user = await User.create({
            email: workEmail.toLowerCase(),
            password: hashedPassword,
            role: 'auditor',
            isActive: hackathonMode ? true : false, // Hackathon: auto-approved
            auditorProfile: {
                name: fullName,
                organization,
                designation,
                licenseNumber,
                specialization: JSON.parse(specialization || '[]'),
                yearsExperience: parseInt(experience, 10),
                status: hackathonMode ? 'approved' : 'pending'
            }
        });

        res.status(201).json({
            success: true,
            message: hackathonMode
                ? 'Registration successful. Account auto-approved (hackathon mode).'
                : 'Registration successful. Account pending admin approval.',
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * LOGIN
 * =========================== */
exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).populate('company');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.role !== role) {
            return res.status(401).json({ success: false, message: `Account is registered as '${user.role}', but you selected '${role}'. Please choose the correct role tab.` });
        }

        // Approval / activation gate (industry + admin skip)
        if ((user.role === 'government' || user.role === 'auditor') && !user.isActive) {
            return res.status(403).json({ success: false, message: 'Account pending verification. Please wait for admin approval.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();

        setTokenCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                ...(user.role === 'industry' && { company: user.company }),
                ...(user.role === 'government' && { governmentProfile: user.governmentProfile }),
                ...(user.role === 'auditor' && { auditorProfile: user.auditorProfile }),
                ...(user.role === 'admin' && { adminProfile: user.adminProfile }),
            }
        });

    } catch (error) {
        next(error);
    }
};


/* ===========================
 * REFRESH TOKEN
 * =========================== */
exports.refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token validation' });
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Token compromised' });
        }

        const newAccessToken = generateAccessToken(user._id);

        res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Refresh failed' });
    }
};

/* ===========================
 * LOGOUT
 * =========================== */
exports.logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
            } catch (e) {
                // Token might be expired, clear cookie regardless
            }
        }

        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
