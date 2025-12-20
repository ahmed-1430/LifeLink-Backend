const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/**
 * GET MATCHING DONORS
 * /api/donors/match
 * Query params:
 *  - bloodGroup
 *  - district
 *  - upazila
 */
router.get("/match", verifyJWT, async (req, res) => {
    try {
        const { bloodGroup, district, upazila } = req.query;

        if (!bloodGroup || !district || !upazila) {
            return res.status(400).json({
                message: "bloodGroup, district, and upazila are required",
            });
        }

        const db = await connectDB();
        const users = db.collection("users");

        const donors = await users
            .find({
                role: "donor",
                status: "active",
                bloodGroup,
                district,
                upazila,
            })
            .project({ password: 0 })
            .toArray();

        res.json(donors);
    } catch (err) {
        console.error("Match donors error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
