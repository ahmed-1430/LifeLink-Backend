const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const connectDB = require("../config/db");
const { ObjectId } = require("mongodb");
const Stripe = require("stripe");

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", verifyJWT, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({ message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: process.env.CURRENCY || "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).send({ message: "Error creating payment intent" });
  }
});


router.post("/fund", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const fundCollection = db.collection("funds");

    const user = req.userInfo;
    const { amount, paymentId } = req.body;

    const funding = {
      userName: user.name,
      userEmail: user.email,
      amount,
      paymentId,
      date: new Date()
    };

    await fundCollection.insertOne(funding);

    res.send({ message: "Funding record saved" });

  } catch (error) {
    console.error("Fund Save Error:", error);
    res.status(500).send({ message: "Error saving funding record" });
  }
});


router.get("/funds", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin" && user.role !== "volunteer") {
      return res.status(403).send({ message: "Only admin or volunteer allowed" });
    }

    const db = await connectDB();
    const fundCollection = db.collection("funds");

    const funds = await fundCollection.find().sort({ date: -1 }).toArray();

    res.send(funds);

  } catch (error) {
    console.error("Get Funds Error:", error);
    res.status(500).send({ message: "Error fetching funds" });
  }
});



router.get("/funds/total", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin" && user.role !== "volunteer") {
      return res.status(403).send({ message: "Only admin or volunteer allowed" });
    }

    const db = await connectDB();
    const fundCollection = db.collection("funds");

    const total = await fundCollection.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]).toArray();

    res.send({ totalFunds: total[0]?.totalAmount || 0 });

  } catch (error) {
    console.error("Total Funds Error:", error);
    res.status(500).send({ message: "Error calculating total funds" });
  }
});


module.exports = router;

