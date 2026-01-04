const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/* ===============================
   CREATE DONATION (DONOR)
================================ */
router.post("/", verifyJWT, async (req, res) => {
    const user = req.userInfo || req.user;;
    if (user.role !== "donor") {
        return res.status(403).send({ message: "Donor only" });
    }

    const db = await connectDB();
    const users = await db.collection("users").findOne({ email: user.email });

    if (users.status === "blocked") {
        return res.status(403).send({ message: "Blocked user" });
    }

    const data = req.body;

    const donation = {
        requesterName: user.name,
        requesterEmail: user.email,
        ...data,
        donationStatus: "pending",
        donorInfo: null,
        createdAt: new Date(),
    };

    await db.collection("donationRequests").insertOne(donation);
    res.send({ message: "Donation request created" });
});

/* ===============================
   MY REQUESTS (DONOR)
================================ */
router.get("/my", verifyJWT, async (req, res) => {
    const db = await connectDB();
    const requests = await db
        .collection("donationRequests")
        .find({ requesterEmail: req.userInfo.email })
        .toArray();

    res.send(requests);
});

/* ===============================
   ALL REQUESTS (ADMIN + VOL)
================================ */
router.get("/", verifyJWT, async (req, res) => {
    if (!["admin", "volunteer"].includes(req.userInfo.role)) {
        return res.status(403).send({ message: "Access denied" });
    }

    const { status } = req.query;
    const query = status ? { donationStatus: status } : {};

    const db = await connectDB();
    const requests = await db
        .collection("donationRequests")
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

    res.send(requests);
});

/* ===============================
   ACCEPT (pending → inprogress)
================================ */
router.patch("/:id/accept", verifyJWT, async (req, res) => {
    if (!["admin", "volunteer"].includes(req.userInfo.role)) {
        return res.status(403).send({ message: "Access denied" });
    }

    const db = await connectDB();
    await db.collection("donationRequests").updateOne(
        { _id: new ObjectId(req.params.id), donationStatus: "pending" },
        {
            $set: {
                donationStatus: "inprogress",
                donorInfo: { name: req.userInfo.name, email: req.userInfo.email },
            },
        }
    );

    res.send({ message: "Donation accepted" });
});

/* ===============================
   DONE (DONOR OWN)
================================ */
router.patch("/:id/done", verifyJWT, async (req, res) => {
    const db = await connectDB();

    const request = await db.collection("donationRequests").findOne({
        _id: new ObjectId(req.params.id),
        requesterEmail: req.userInfo.email,
        donationStatus: "inprogress",
    });

    if (!request) {
        return res.status(403).send({ message: "Not allowed" });
    }

    await db.collection("donationRequests").updateOne(
        { _id: request._id },
        { $set: { donationStatus: "done" } }
    );

    res.send({ message: "Donation completed" });
});

/* ===============================
   CANCEL (DONOR OWN)
================================ */
router.patch("/:id/cancel", verifyJWT, async (req, res) => {
    const db = await connectDB();

    const request = await db.collection("donationRequests").findOne({
        _id: new ObjectId(req.params.id),
        requesterEmail: req.userInfo.email,
    });

    if (!request) {
        return res.status(403).send({ message: "Not allowed" });
    }

    await db.collection("donationRequests").updateOne(
        { _id: request._id },
        { $set: { donationStatus: "canceled" } }
    );

    res.send({ message: "Donation canceled" });
});

module.exports = router;
