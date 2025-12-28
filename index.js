const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db.js");

// All Routes files
const authRoutes = require("./routes/authRoutes.js");

const donationRoutes = require("./routes/donationRoutes.js");

const adminRoutes = require("./routes/adminRoutes.js");
const geoRoutes = require("./routes/geoRoutes.js");
const fundRoutes = require("./routes/fundRoutes.js");
const volunteerRoutes = require("./routes/volunteerRoutes.js")
const donorRoutes = require("./routes/donorRoutes.js");


const app = express();
app.use(cors());
app.use(express.json());

// Use API for All routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/volunteer", volunteerRoutes);




app.get("/", (req, res) => {
  res.send("LifeLink Server Running...");
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});
