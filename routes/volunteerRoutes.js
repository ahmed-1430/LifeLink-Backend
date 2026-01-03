const express = require("express");
const connectDB = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Update availability + location
router.patch("/availability", requireAuth, requireRole("volunteer"), async (req, res) => {
    const { availability, district, upazila } = req.body;

    if (!["active", "inactive"].includes(availability)) {
        return res.status(400).json({ message: "Invalid availability" });
    }

    try {
        const db = await connectDB();
        await db.collection("users").updateOne(
            { _id: new ObjectId(req.userInfo._id) },
            { $set: { availability, district, upazila } }
        );

        res.json({ message: "Availability updated" });
    } catch (err) {
        console.error("Update availability error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
