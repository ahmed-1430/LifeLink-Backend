const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db.js");

// Route files
const authRoutes = require("./routes/authRoutes.js");
const donationRoutes = require("./routes/donationRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const geoRoutes = require("./routes/geoRoutes.js");
const fundRoutes = require("./routes/fundRoutes.js");
const volunteerRoutes = require("./routes/volunteerRoutes.js");
const donorRoutes = require("./routes/donorRoutes.js");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE (IMPORTANT)
================================ */
connectDB();

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/volunteer", volunteerRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("LifeLink Server Running ");
});

/* ===============================
   EXPORT FOR VERCEL
================================ */
module.exports = app;
