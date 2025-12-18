const express = require("express");
const connectDB = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Get my notifications
router.get("/", requireAuth, async (req, res) => {
    try {
        const db = await connectDB();
        const list = await db
            .collection("notifications")
            .find({ userId: new ObjectId(req.user._id) })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(list);
    } catch (err) {
        console.error("Get notifications error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
    try {
        const db = await connectDB();
        await db.collection("notifications").updateOne(
            { _id: new ObjectId(req.params.id), userId: new ObjectId(req.user._id) },
            { $set: { read: true } }
        );

        res.json({ message: "Marked as read" });
    } catch (err) {
        console.error("Mark read error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
