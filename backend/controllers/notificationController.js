const Notification = require('../models/notificationModel');


const createNotification = async (req, res) => {
    try {
        const { title, message, targetRoles = [], targetUserIds = [], schoolId, createdBy } = req.body;

        const notification = new Notification({
            title,
            message,
            targetRoles,
            targetUserIds,
            schoolId,
            createdBy,
        });

        await notification.save();
        res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error("Create Notification Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


const getMyNotifications = async (req, res) => {
    try {
        const { userId, role, schoolId } = req.query;


        if (!userId || !role || !schoolId) {
            return res.status(400).json({ success: false, message: "Missing required parameters" });
        }

        const notifications = await Notification.find({
            schoolId,
            $or: [
                { targetRoles: role },
                { targetUserIds: userId },
                { targetRoles: { $size: 0 } }
            ]
        }).sort({ createdAt: -1 });
        

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


const markAsRead = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        const alreadyRead = notification.isReadBy.some(r => r.userId.toString() === userId);
        if (!alreadyRead) {
            notification.isReadBy.push({ userId, role, readAt: new Date() });
            await notification.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Mark As Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const { userId } = req.body;

        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    deleteNotification,
    markAsRead,
    getMyNotifications,
    createNotification
}
