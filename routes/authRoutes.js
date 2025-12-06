const express = require("express");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db.js");

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { name, email, password, avatar, bloodGroup, district, upazila } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const exists = await usersCollection.findOne({ email });
    if (exists) {
      return res.status(409).send({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      avatar,
      bloodGroup,
      district,
      upazila,
      role: "donor",
      status: "active",
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    res.send({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send({ message: "Server error during registration" });
  }
});



module.exports = router;
