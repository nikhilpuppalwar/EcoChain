const MarketplaceListing = require('../models/MarketplaceListing');
const CreditTransaction = require('../models/CreditTransaction');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const { sendToUser } = require('../utils/websocket');

/* ===========================
 * GET ALL ACTIVE LISTINGS (Public to all logged-in users)
 * =========================== */
exports.getAllListings = async (req, res, next) => {
    try {
        const listings = await MarketplaceListing.find({ status: 'active' })
            .populate('seller', 'name sector state')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: listings });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET MY LISTINGS (Industry specific)
 * =========================== */
exports.getMyListings = async (req, res, next) => {
    try {
        const listings = await MarketplaceListing.find({ seller: req.user.company })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: listings });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CREATE LISTING
 * =========================== */
exports.createListing = async (req, res, next) => {
    try {
        const { creditsAvailable, pricePerCredit, durationDays, onChainTxHash } = req.body;

        const company = await Company.findById(req.user.company);

        if (company.creditBalance < creditsAvailable) {
            return res.status(400).json({ success: false, message: 'Insufficient credit balance to list' });
        }

        // Deduct from balance
        company.creditBalance -= creditsAvailable;
        await company.save();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (parseInt(durationDays) || 30));

        const listing = await MarketplaceListing.create({
            seller: req.user.company,
            creditsAvailable,
            pricePerCredit,
            expiresAt,
            txHash: onChainTxHash // From frontend web3 tx
        });

        res.status(201).json({ success: true, data: listing });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * BUY CREDITS
 * =========================== */
exports.buyCredits = async (req, res, next) => {
    try {
        const { amount, onChainTxHash } = req.body;
        const buyerCompanyId = req.user.company;

        const listing = await MarketplaceListing.findById(req.params.id)
            .populate('seller', 'name adminUser');

        if (!listing || listing.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Listing not found or not active' });
        }

        if (listing.creditsAvailable < amount) {
            return res.status(400).json({ success: false, message: 'Not enough credits available in this listing' });
        }

        const sellerCompany = await Company.findById(listing.seller._id);
        const buyerCompany = await Company.findById(buyerCompanyId);

        // Create transaction record
        const totalValue = amount * listing.pricePerCredit;
        const transaction = await CreditTransaction.create({
            fromCompany: sellerCompany._id,
            toCompany: buyerCompany._id,
            credits: amount,
            pricePerCredit: listing.pricePerCredit,
            totalValue,
            type: 'purchase',
            listingId: listing._id,
            txHash: onChainTxHash
        });

        // Update Buyer Balance (Seller balance was already deducted on listing)
        buyerCompany.creditBalance += amount;
        await buyerCompany.save();

        // Update Listing
        listing.creditsAvailable -= amount;
        if (listing.creditsAvailable === 0) {
            listing.status = 'sold';
        }
        await listing.save();

        // Notify Seller
        await Notification.create({
            user: sellerCompany.adminUser,
            type: 'trade_completed',
            title: 'Credits Sold',
            message: `${buyerCompany.name} purchased ${amount} credits from your listing for ${totalValue} INR/ETH.`
        });

        sendToUser(sellerCompany.adminUser, {
            type: 'trade_completed',
            message: 'Your listed credits have been sold'
        });

        // Notify Buyer
        await Notification.create({
            user: req.user._id,
            type: 'trade_completed',
            title: 'Purchase Successful',
            message: `You purchased ${amount} credits from ${sellerCompany.name}.`
        });

        res.status(200).json({ success: true, data: transaction, message: 'Purchase successful' });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * CANCEL LISTING
 * =========================== */
exports.cancelListing = async (req, res, next) => {
    try {
        const listing = await MarketplaceListing.findOne({ _id: req.params.id, seller: req.user.company });

        if (!listing || listing.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Listing not found or already closed' });
        }

        // Restore credits to seller
        const company = await Company.findById(req.user.company);
        company.creditBalance += listing.creditsAvailable;
        await company.save();

        // Mark cancelled
        listing.status = 'cancelled';
        listing.creditsAvailable = 0;
        await listing.save();

        res.status(200).json({ success: true, message: 'Listing cancelled successfully. Credits restored to wallet.' });
    } catch (error) {
        next(error);
    }
};
