const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

/* ===============================
   ADMIN GUARD
================================ */
const requireAdmin = (req, res, next) => {
  if (!req.userInfo || req.userInfo.role !== "admin") {
    return res.status(403).send({ message: "Admin access only" });
  }
  next();
};

/* ===============================
   GET ALL USERS
================================ */
router.get("/users", verifyJWT, requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.send(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).send({ message: "Failed to fetch users" });
  }
});

/* ===============================
   BLOCK USER
================================ */
router.patch("/users/block/:id", verifyJWT, requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "blocked" } }
    );

    res.send({ message: "User blocked" });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).send({ message: "Failed to block user" });
  }
});

/* ===============================
   UNBLOCK USER
================================ */
router.patch("/users/unblock/:id", verifyJWT, requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "active" } }
    );

    res.send({ message: "User unblocked" });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).send({ message: "Failed to unblock user" });
  }
});

/* ===============================
   MAKE VOLUNTEER
================================ */
router.patch(
  "/users/make-volunteer/:id",
  verifyJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const db = await connectDB();

      await db.collection("users").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role: "volunteer" } }
      );

      res.send({ message: "User promoted to volunteer" });
    } catch (err) {
      console.error("Make volunteer error:", err);
      res.status(500).send({ message: "Failed to promote user" });
    }
  }
);

/* ===============================
   MAKE ADMIN
================================ */
router.patch(
  "/users/make-admin/:id",
  verifyJWT,
  requireAdmin,
  async (req, res) => {
    try {
      if (req.userInfo.userId === req.params.id) {
        return res
          .status(400)
          .send({ message: "You cannot change your own role" });
      }

      const db = await connectDB();

      await db.collection("users").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role: "admin" } }
      );

      res.send({ message: "User promoted to admin" });
    } catch (err) {
      console.error("Make admin error:", err);
      res.status(500).send({ message: "Failed to promote admin" });
    }
  }
);

module.exports = router;
