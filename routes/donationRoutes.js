const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/* ===============================
   CREATE DONATION (DONOR ONLY)
================================ */
router.post("/", verifyJWT, async (req, res) => {
    try {
        const user = req.userInfo;

        if (user.role !== "donor") {
            return res.status(403).json({ message: "Donor only" });
        }

        const db = await connectDB();

        const dbUser = await db
            .collection("users")
            .findOne({ email: user.email });

        if (!dbUser || dbUser.status === "blocked") {
            return res.status(403).json({ message: "Blocked user" });
        }

        const donation = {
            requesterName: user.name,
            requesterEmail: user.email,

            recipientName: req.body.recipientName,
            recipientDistrict: req.body.recipientDistrict,
            recipientUpazila: req.body.recipientUpazila,
            hospitalName: req.body.hospitalName,
            fullAddress: req.body.fullAddress,
            bloodGroup: req.body.bloodGroup,
            donationDate: req.body.donationDate,
            donationTime: req.body.donationTime,
            requestMessage: req.body.requestMessage,

            donationStatus: "pending",
            donorInfo: null,
            createdAt: new Date(),
        };

        await db.collection("donationRequests").insertOne(donation);

        res.json({ message: "Donation request created" });
    } catch (err) {
        console.error("Create donation error:", err);
        res.status(500).json({ message: "Failed to create donation request" });
    }
});

/* ===============================
   MY REQUESTS (DONOR)
================================ */
router.get("/my", verifyJWT, async (req, res) => {
    try {
        const db = await connectDB();

        const requests = await db
            .collection("donationRequests")
            .find({ requesterEmail: req.userInfo.email })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(requests);
    } catch (err) {
        console.error("My requests error:", err);
        res.status(500).json({ message: "Failed to load requests" });
    }
});

/* ===============================
   ALL REQUESTS (ADMIN + VOL)
================================ */
router.get("/", verifyJWT, async (req, res) => {
    try {
        if (!["admin", "volunteer"].includes(req.userInfo.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const db = await connectDB();

        const query = req.query.status
            ? { donationStatus: req.query.status }
            : {};

        const requests = await db
            .collection("donationRequests")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(requests);
    } catch (err) {
        console.error("All requests error:", err);
        res.status(500).json({ message: "Failed to load requests" });
    }
});

/* ===============================
   ACCEPT (pending → inprogress)
   ADMIN + VOLUNTEER
================================ */
router.patch("/accept/:id", verifyJWT, async (req, res) => {
    try {
        if (!["admin", "volunteer"].includes(req.userInfo.role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const db = await connectDB();

        const result = await db.collection("donationRequests").updateOne(
            { _id: new ObjectId(req.params.id), donationStatus: "pending" },
            {
                $set: {
                    donationStatus: "inprogress",
                    donorInfo: {
                        name: req.userInfo.name,
                        email: req.userInfo.email,
                    },
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Donation request accepted" });
    } catch (err) {
        console.error("Accept error:", err);
        res.status(500).json({ message: "Failed to accept request" });
    }
});

/* ===============================
   DONE (ADMIN ONLY)
================================ */
router.patch("/done/:id", verifyJWT, async (req, res) => {
    try {
        if (req.userInfo.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const db = await connectDB();

        const result = await db.collection("donationRequests").updateOne(
            { _id: new ObjectId(req.params.id), donationStatus: "inprogress" },
            { $set: { donationStatus: "done" } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Donation marked as completed" });
    } catch (err) {
        console.error("Done error:", err);
        res.status(500).json({ message: "Failed to mark donation done" });
    }
});

/* ===============================
   CANCEL (ADMIN ONLY)
================================ */
router.patch("/cancel/:id", verifyJWT, async (req, res) => {
    try {
        if (req.userInfo.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const db = await connectDB();

        const result = await db.collection("donationRequests").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { donationStatus: "canceled" } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Donation canceled" });
    } catch (err) {
        console.error("Cancel error:", err);
        res.status(500).json({ message: "Failed to cancel donation" });
    }
});

module.exports = router;
