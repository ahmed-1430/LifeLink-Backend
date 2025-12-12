const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware"); // see middleware below (or adapt to your project)

const router = express.Router();

// Accept a request (volunteer)
router.post("/:id/accept", requireAuth, requireRole("volunteer"), async (req, res) => {
    const requestId = req.params.id;
    const user = req.user; // filled by requireAuth middleware (should include user._id and role)

    if (!ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request id" });
    }

    try {
        const db = await connectDB();
        const requestsColl = db.collection("requests");

        // Find request
        const reqDoc = await requestsColl.findOne({ _id: new ObjectId(requestId) });
        if (!reqDoc) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Prevent accepting if already accepted or completed
        if (reqDoc.status === "accepted") {
            return res.status(409).json({ message: "Request already accepted" });
        }
        if (reqDoc.status === "completed") {
            return res.status(409).json({ message: "Request already completed" });
        }

        const update = {
            $set: {
                status: "accepted",
                acceptedBy: {
                    _id: user._id,
                    name: user.name || user.email,
                },
                acceptedAt: new Date(),
            },
        };

        const result = await requestsColl.findOneAndUpdate(
            { _id: new ObjectId(requestId) },
            update,
            { returnDocument: "after" }
        );

        return res.json({ message: "Request accepted", request: result.value });
    } catch (err) {
        console.error("Accept request error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
