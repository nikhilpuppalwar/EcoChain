const EmissionEntry = require('../models/EmissionEntry');
const BlockchainEvent = require('../models/BlockchainEvent');

/**
 * GET /api/public/ledger
 * Returns blockchain events for the transparency dashboard.
 * Optionally filter by industryId (company ObjectId).
 */
exports.getPublicLedger = async (req, res, next) => {
    try {
        const { industryId } = req.query;
        const filter = industryId ? { companyId: industryId } : {};

        // Fetch the most recent 50 blockchain events
        const events = await BlockchainEvent.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Aggregate macro stats from EmissionEntry (approved ones)
        const approvedEmissions = await EmissionEntry.find({ status: 'approved' }).lean();
        const totalVerifiedEmissions = approvedEmissions.reduce((sum, e) => sum + (e.quantityTonnes || 0), 0);

        // Count participating industries
        const uniqueCompanies = new Set(approvedEmissions.map(e => e.company?.toString())).size;

        return res.json({
            success: true,
            data: {
                recentPublicLedger: events.map(e => ({
                    _id: e._id,
                    eventType: e.eventType,
                    companyName: e.companyName,
                    quantityTonnes: e.quantityTonnes,
                    period: e.period,
                    txHash: e.txHash,
                    dataHash: e.dataHash,
                    details: e.details,
                    actor: e.actor,
                    createdAt: e.createdAt
                })),
                topPerformers: [],
                macroStats: {
                    totalVerifiedEmissions,
                    participatingEntities: uniqueCompanies
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

