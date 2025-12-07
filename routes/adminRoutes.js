const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// GET ALL USERS (Admin Only)
router.get("/users", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.send(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).send({ message: "Error fetching users" });
  }
});


// BLOCK USER
router.patch("/users/block/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "blocked" } }
    );

    res.send({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).send({ message: "Error blocking user" });
  }
});


// UNBLOCK USER
router.patch("/users/unblock/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "active" } }
    );

    res.send({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Unblock User Error:", error);
    res.status(500).send({ message: "Error unblocking user" });
  }
});


// MAKE VOLUNTEER
router.patch("/users/make-volunteer/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: "volunteer" } }
    );

    res.send({ message: "User promoted to volunteer" });
  } catch (error) {
    console.error("Make Volunteer Error:", error);
    res.status(500).send({ message: "Error promoting user" });
  }
});


// MAKE ADMIN
router.patch("/users/make-admin/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: "admin" } }
    );

    res.send({ message: "User promoted to admin" });
  } catch (error) {
    console.error("Make Admin Error:", error);
    res.status(500).send({ message: "Error promoting user" });
  }
});

module.exports = router;
