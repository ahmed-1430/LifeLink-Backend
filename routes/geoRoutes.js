const express = require("express");
const connectDB = require("../config/db");

const router = express.Router();

// GET ALL DISTRICTS
router.get("/districts", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("districts");

    const tableDoc = await collection.findOne({ name: "districts" });

    if (!tableDoc || !tableDoc.data) {
      return res.send([]);
    }

    res.send(tableDoc.data);
  } catch (error) {
    console.error("District Fetch Error:", error);
    res.status(500).send({ message: "Error fetching districts" });
  }
});



// GET UPAZILAS BY DISTRICT ID
router.get("/upazilas/:districtId", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("upazilas");

    const tableDoc = await collection.findOne({ name: "upazilas" });

    if (!tableDoc || !tableDoc.data) {
      return res.send([]);
    }

    const filtered = tableDoc.data.filter(
      (u) => u.district_id === req.params.districtId
    );

    res.send(filtered);
  } catch (error) {
    console.error("Upazila Fetch Error:", error);
    res.status(500).send({ message: "Error fetching upazilas" });
  }
});



module.exports = router;
