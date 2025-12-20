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


// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.status && user.status === "blocked") {
      return res.status(403).send({ message: "User is blocked. Contact admin." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // Create JWT payload (keep it small)
    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    // Sign token
    const token = require("jsonwebtoken").sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    });

    // Respond with token and safe user data
    res.send({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ message: "Server error during login" });
  }
});


const verifyJWT = require("../middleware/verifyJWT");
const { ObjectId } = require("mongodb");

// GET USER PROFILE
router.get("/profile", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const userId = req.user.userId;

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // never return password
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).send({ message: "Server error fetching profile" });
  }
});


// UPDATE USER PROFILE
router.put("/profile", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const userId = req.user.userId;

    // allowed updates only
    const { name, avatar, district, upazila, bloodGroup } = req.body;

    const updateDoc = {
      $set: {
        name,
        avatar,
        district,
        upazila,
        bloodGroup,
      },
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      updateDoc
    );

    res.send({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).send({ message: "Server error updating profile" });
  }
});





module.exports = router;
