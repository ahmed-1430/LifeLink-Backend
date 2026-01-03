const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// GET ALL USERS (Admin Only)
router.get("/users", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfoInfo;

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
    const user = req.userInfoInfo;

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
    const user = req.userInfoInfo;

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
    const user = req.userInfoInfo;

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
    const requester = req.userInfoInfo;
    const targetUserId = req.params.id;

    if (requester.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    if (requester.userId === targetUserId) {
      return res
        .status(400)
        .send({ message: "You cannot change your own role" });
    }

    if (!ObjectId.isValid(targetUserId)) {
      return res.status(400).send({ message: "Invalid user id" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(targetUserId),
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(409)
        .send({ message: "User is already an admin" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $set: { role: "admin" } }
    );

    res.send({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Make Admin Error:", error);
    res.status(500).send({ message: "Error promoting user" });
  }
});


// Admin: get all requests
router.get("/requests", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfoInfo;

    if (user.role !== "admin" || user.role !== "volunteer" || user.role !== "donor") {
      return res.status(403).send({ message: "Access Denied" });
    }

    const db = await connectDB();
    const requests = await db
      .collection("requests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.send(requests);
  } catch (err) {
    console.error("Admin fetch requests error:", err);
    res.status(500).send({ message: "Server error" });
  }
});


module.exports = router;
