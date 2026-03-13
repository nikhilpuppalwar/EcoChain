const EmissionEntry = require('../models/EmissionEntry');
const Notification = require('../models/Notification');
const User = require('../models/User');
const cloudinaryUtil = require('../utils/cloudinary');
const { broadcastToRole } = require('../utils/websocket');
const { calculateCO2e } = require('../utils/co2Calculator');

/* ===========================
 * GET ALL ENTRIES (FOR USER'S COMPANY)
 * =========================== */
exports.getEmissions = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const query = { company: req.user.company };

        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.year) {
            query.periodYear = req.query.year;
        }

        const emissions = await EmissionEntry.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await EmissionEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            data: emissions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CREATE NEW ENTRY
 * =========================== */
exports.createEmission = async (req, res, next) => {
    try {
        const { 
            periodMonth, periodYear, quantityTonnes, emissionSource, notes, location,
            wasteGeneration, logisticsTransport, vehicleEmissions, productionOutput
        } = req.body;
        
        if (!periodMonth || !periodYear || !quantityTonnes || !emissionSource || !notes) {
            return res.status(400).json({ success: false, message: 'All fields are mandatory, including emissionSource and notes' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Evidence document is mandatory' });
        }

        const evidenceFileName = req.file.originalname;
        const evidenceUrl = await cloudinaryUtil.uploadFile(req.file.buffer, evidenceFileName, req.file.mimetype);

        // Map frontend JSON strings back to objects (if they are passed as JSON strings via form-data)
        const parsedWaste = wasteGeneration ? JSON.parse(wasteGeneration) : undefined;
        const parsedLogistics = logisticsTransport ? JSON.parse(logisticsTransport) : undefined;
        const parsedVehicles = vehicleEmissions ? JSON.parse(vehicleEmissions) : undefined;
        const parsedProduction = productionOutput ? JSON.parse(productionOutput) : undefined;

        const emission = await EmissionEntry.create({
            company: req.user.company,
            periodMonth,
            periodYear,
            quantityTonnes,
            emissionSource,
            notes,
            location,
            wasteGeneration: parsedWaste,
            logisticsTransport: parsedLogistics,
            vehicleEmissions: parsedVehicles,
            productionOutput: parsedProduction,
            evidenceFileName,
            evidenceUrl,
            status: 'submitted' // Starts at submitted, awaits AI check -> 'pending_govt_assignment'
        });

        // Notify government users
        const govUsers = await User.find({ role: 'government', isActive: true });

        // Create notifications for all gov admins (in production, targeted by jurisdiction)
        const notifications = govUsers.map(govUser => ({
            user: govUser._id,
            type: 'compliance_alert',
            title: 'New Emission Report',
            message: `A new emission report of ${quantityTonnes} tCO2e was submitted and is pending AI check.`
        }));
        await Notification.insertMany(notifications);

        broadcastToRole('government', {
            type: 'report_submitted',
            emissionId: emission._id,
            message: 'A new emission report was submitted'
        });

        res.status(201).json({ success: true, data: emission });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET SINGLE ENTRY
 * =========================== */
exports.getEmissionById = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        res.status(200).json({ success: true, data: emission });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * UPDATE ENTRY (If Pending)
 * =========================== */
exports.updateEmission = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        if (emission.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending emissions can be updated' });
        }

        const { periodMonth, periodYear, quantityTonnes, emissionSource, notes } = req.body;

        emission.periodMonth = periodMonth || emission.periodMonth;
        emission.periodYear = periodYear || emission.periodYear;
        emission.quantityTonnes = quantityTonnes || emission.quantityTonnes;
        emission.emissionSource = emissionSource || emission.emissionSource;
        emission.notes = notes || emission.notes;

        if (req.file) {
            emission.evidenceFileName = req.file.originalname;
            emission.evidenceUrl = await cloudinaryUtil.uploadFile(
                req.file.buffer,
                emission.evidenceFileName,
                req.file.mimetype
            );
        }

        await emission.save();
        res.status(200).json({ success: true, data: emission });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * DELETE ENTRY (If Pending)
 * =========================== */
exports.deleteEmission = async (req, res, next) => {
    try {
        const emission = await EmissionEntry.findOne({ _id: req.params.id, company: req.user.company });
        if (!emission) return res.status(404).json({ success: false, message: 'Emission entry not found' });

        if (emission.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending emissions can be deleted' });
        }

        await emission.deleteOne();
        res.status(200).json({ success: true, message: 'Emission entry deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CALCULATE EMISSIONS
 * =========================== */
exports.calculateEmissions = async (req, res, next) => {
    try {
        const breakdown = await calculateCO2e(req.body);
        res.status(200).json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        next(error);
    }
};
