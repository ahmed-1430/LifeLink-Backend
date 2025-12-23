const express = require("express");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/**
 * GET MATCHING DONORS
 * /api/donors/match?bloodGroup=&district=&upazila=
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
    const usersCollection = db.collection("users");

    const donors = await usersCollection
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
  } catch (error) {
    console.error("Match donors error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
