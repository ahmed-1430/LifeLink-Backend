const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../config/db.js");
const verifyJWT = require("../middleware/verifyJWT.js");

const router = express.Router();

// CREATE DONATION REQUEST
router.post("/donation", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const user = req.userInfo;

    // Blocked users cannot create requests
    if (user.status === "blocked") {
      return res.status(403).send({ message: "Blocked users cannot create donation requests" });
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
      requestMessage
    } = req.body;

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
      createdAt: new Date()
    };

    await collection.insertOne(newRequest);

    res.send({ message: "Donation request created successfully" });
  } catch (error) {
    console.error("Create Donation Request Error:", error);
    res.status(500).send({ message: "Error creating donation request" });
  }
});

// users request
router.get("/my-requests", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const email = req.userInfo.email;

    const requests = await collection
      .find({ requesterEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(requests);
  } catch (error) {
    console.error("My Donation Requests Error:", error);
    res.status(500).send({ message: "Error fetching your requests" });
  }
});

// all request only for admin and volunteer
router.get("/all-requests", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    if (user.role !== "admin" && user.role !== "volunteer") {
      return res.status(403).send({ message: "Access denied" });
    }

    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const requests = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.send(requests);
  } catch (error) {
    console.error("All Requests Error:", error);
    res.status(500).send({ message: "Error fetching donation requests" });
  }
});

// donation details find by id
router.get("/donation/:id", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const request = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!request) return res.status(404).send({ message: "Request not found" });

    res.send(request);
  } catch (error) {
    console.error("Request Details Error:", error);
    res.status(500).send({ message: "Error fetching request details" });
  }
});

// dontaion req update
router.put("/donation/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const existing = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!existing) return res.status(404).send({ message: "Request not found" });

    // Only the requester can update
    if (existing.requesterEmail !== user.email) {
      return res.status(403).send({ message: "Not allowed to update this request" });
    }

    const update = {
      $set: req.body
    };

    await collection.updateOne({ _id: new ObjectId(req.params.id) }, update);

    res.send({ message: "Donation request updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).send({ message: "Error updating request" });
  }
});


router.delete("/donation/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const existing = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!existing) return res.status(404).send({ message: "Request not found" });

    if (existing.requesterEmail !== user.email) {
      return res.status(403).send({ message: "Not allowed to delete this request" });
    }

    await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    res.send({ message: "Donation request deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send({ message: "Error deleting request" });
  }
});


// pending => inprogress => accept request

router.patch("/donation/accept/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.userInfo;

    const db = await connectDB();
    const collection = db.collection("donationRequests");

    const update = {
      $set: {
        donationStatus: "inprogress",
        donorInfo: {
          donorName: user.name,
          donorEmail: user.email,
        },
      },
    };

    await collection.updateOne({ _id: new ObjectId(req.params.id) }, update);

    res.send({ message: "Donation request accepted" });
  } catch (error) {
    res.status(500).send({ message: "Error accepting request" });
  }
});


// inprogress => done
router.patch("/donation/done/:id", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("donationRequests");

    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { donationStatus: "done" } }
    );

    res.send({ message: "Donation marked as done" });
  } catch (error) {
    res.status(500).send({ message: "Error updating status" });
  }
});


// in progress => cancel
router.patch("/donation/cancel/:id", verifyJWT, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("donationRequests");

    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { donationStatus: "canceled" } }
    );

    res.send({ message: "Donation marked as canceled" });
  } catch (error) {
    res.status(500).send({ message: "Error updating status" });
  }
});

module.exports = router;
