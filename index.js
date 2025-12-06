const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Root Directory
app.get("/", async (req, res) => {
  await connectDB();
  res.send("LifeLink Server Running...");
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});
