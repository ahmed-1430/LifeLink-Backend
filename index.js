const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db.js");

// auth login---- register-- profile-- get/update
const authRoutes = require("./routes/authRoutes.js");

const donationRoutes = require("./routes/donationRoutes.js");

const app = express();
app.use(cors());
app.use(express.json());

// Use API routes
app.use("/api", authRoutes);

app.use("/api", donationRoutes);


app.get("/", (req, res) => {
  res.send("LifeLink Server Running...");
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});
