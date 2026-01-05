const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");
const { ObjectId } = require("mongodb");

const router = express.Router();

/* ===============================
   REGISTER
================================ */
router.post("/register", async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { name, email, password, avatar, bloodGroup, district, upazila } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      avatar: avatar || "",
      bloodGroup,
      district,
      upazila,
      role: "donor",
      status: "active",
      createdAt: new Date(),
    };

    await users.insertOne(newUser);

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* ===============================
   LOGIN
================================ */
router.post("/login", async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { email, password } = req.body;

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      avatar: user.avatar || "",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    });

    res.json({
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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ===============================
   GET PROFILE
================================ */
router.get("/profile", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(req.userInfo.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

/* ===============================
   UPDATE PROFILE
================================ */
router.patch("/profile", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const updates = {};
    ["name", "avatar", "district", "upazila", "bloodGroup"].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await users.updateOne(
      { _id: new ObjectId(req.userInfo.userId) },
      { $set: updates }
    );

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ===============================
   CHANGE PASSWORD (SECURITY TAB)
================================ */
router.patch("/password", verifyJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({
      _id: new ObjectId(req.userInfo.userId),
    });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await users.updateOne(
      { _id: user._id },
      { $set: { password: hashed } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

module.exports = router;
