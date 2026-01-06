const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const connectDB = require("../config/db");
const { ObjectId } = require("mongodb");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   CREATE STRIPE PAYMENT INTENT
================================ */
router.post("/create-intent", verifyJWT, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({ message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: process.env.CURRENCY || "usd",
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send({ message: "Payment intent failed" });
  }
});

/* ===============================
   SAVE FUND RECORD (AFTER PAYMENT)
================================ */
router.post("/", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const funds = db.collection("funds");

    const user = req.userInfo;
    const { amount, paymentId } = req.body;

    if (!amount || !paymentId) {
      return res.status(400).send({ message: "Missing data" });
    }

    const record = {
      userId: new ObjectId(user.userId),
      userName: user.name,
      userEmail: user.email,
      amount,
      paymentId,
      createdAt: new Date(),
    };

    await funds.insertOne(record);

    res.send({ message: "Funding saved" });
  } catch (err) {
    console.error("Save fund error:", err);
    res.status(500).send({ message: "Failed to save funding" });
  }
});

/* ===============================
   GET ALL FUNDS (ADMIN / VOL)
================================ */
router.get("/", verifyJWT, async (req, res) => {
  const user = req.userInfo;

  if (!["admin", "volunteer"].includes(user.role)) {
    return res.status(403).send({ message: "Access denied" });
  }

  const db = await connectDB();
  const funds = await db
    .collection("funds")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(funds);
});

/* ===============================
   GET TOTAL FUND AMOUNT
================================ */
router.get("/total", verifyJWT, async (req, res) => {
  const user = req.userInfo;

  if (!["admin", "volunteer"].includes(user.role)) {
    return res.status(403).send({ message: "Access denied" });
  }

  const db = await connectDB();
  const result = await db.collection("funds").aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).toArray();

  res.send({ total: result[0]?.total || 0 });
});

module.exports = router;
