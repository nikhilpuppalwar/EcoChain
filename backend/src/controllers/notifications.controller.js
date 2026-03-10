const Notification = require('../models/Notification');

/* ===========================
 * GET MY NOTIFICATIONS (Unread First)
 * =========================== */
exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ isRead: 1, createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        res.status(200).json({ success: true, unreadCount, data: notifications });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * MARK VISIBLE/SINGLE AS READ
 * =========================== */
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * MARK ALL AS READ
 * =========================== */
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
