const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/* ===============================
   CREATE DONATION REQUEST (DONOR)
================================ */
router.post("/donation", verifyJWT, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("donationRequests");
        const user = req.userInfo;

        if (user.status === "blocked") {
            return res.status(403).send({ message: "Blocked users cannot create requests" });
        }

        const {
            recipientName,
            recipientDistrict,
            recipientUpazila,
            hospitalName,
            fullAddress,
            bloodGroup,
            donationDate,
            donationTime,
            requestMessage,
        } = req.body;

        if (
            !recipientName ||
            !recipientDistrict ||
            !recipientUpazila ||
            !hospitalName ||
            !fullAddress ||
            !bloodGroup ||
            !donationDate ||
            !donationTime ||
            !requestMessage
        ) {
            return res.status(400).send({ message: "All fields are required" });
        }

        const newRequest = {
            requesterName: user.name,
            requesterEmail: user.email,
            recipientName,
            recipientDistrict,
            recipientUpazila,
            hospitalName,
            fullAddress,
            bloodGroup,
            donationDate,
            donationTime,
            requestMessage,
            donationStatus: "pending",
            donorInfo: null,
            createdAt: new Date(),
        };

        await collection.insertOne(newRequest);
        res.status(201).send({ message: "Donation request created" });
    } catch (err) {
        res.status(500).send({ message: "Server error" });
    }
});

/* ===============================
   MY REQUESTS (DONOR)
================================ */
router.get("/my-requests", verifyJWT, async (req, res) => {
    const db = await connectDB();
    const requests = await db
        .collection("donationRequests")
        .find({ requesterEmail: req.userInfo.email })
        .sort({ createdAt: -1 })
        .toArray();
    res.send(requests);
});

/* ===============================
   ALL REQUESTS (DONOR + VOL + ADMIN)
================================ */
router.get("/all-requests", verifyJWT, async (req, res) => {
    const db = await connectDB();
    const requests = await db
        .collection("donationRequests")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    res.send(requests);
});

/* ===============================
   ACCEPT REQUEST
   pending → inprogress
================================ */
router.patch("/donation/accept/:id", verifyJWT, async (req, res) => {
    const user = req.userInfo;
    if (!["admin", "volunteer"].includes(user.role)) {
        return res.status(403).send({ message: "Access denied" });
    }

    const db = await connectDB();
    await db.collection("donationRequests").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
            $set: {
                donationStatus: "inprogress",
                donorInfo: { name: user.name, email: user.email },
            },
        }
    );

    res.send({ message: "Request accepted" });
});

/* ===============================
   COMPLETE REQUEST
   inprogress → done
================================ */
router.patch("/donation/done/:id", verifyJWT, async (req, res) => {
    const user = req.userInfo;
    if (!["admin", "volunteer"].includes(user.role)) {
        return res.status(403).send({ message: "Access denied" });
    }

    const db = await connectDB();
    await db.collection("donationRequests").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { donationStatus: "done" } }
    );

    res.send({ message: "Donation completed" });
});

/* ===============================
   CANCEL REQUEST
================================ */
router.patch("/donation/cancel/:id", verifyJWT, async (req, res) => {
    const user = req.userInfo;
    if (!["admin", "volunteer"].includes(user.role)) {
        return res.status(403).send({ message: "Access denied" });
    }

    const db = await connectDB();
    await db.collection("donationRequests").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { donationStatus: "canceled" } }
    );

    res.send({ message: "Donation canceled" });
});

module.exports = router;
