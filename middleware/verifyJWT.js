const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const { ObjectId } = require("mongodb");

const verifyJWT = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).send({ message: "Unauthorized: No token" });
    }

    const token = auth.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Fetch full user from DB
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Blocked user check
    if (user.status === "blocked") {
      return res.status(403).send({ message: "User is blocked by admin" });
    }

    // Attach decoded minimal payload
    req.user = decoded;

    // Attach full DB user
    req.userInfo = user;

    next();
  } catch (error) {
    console.error("JWT Middleware Error:", error);
    return res.status(403).send({ message: "Forbidden: Invalid token" });
  }
};

module.exports = verifyJWT;
