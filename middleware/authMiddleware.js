// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const { ObjectId } = require("mongodb");

const requireAuth = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing auth token" });
        }
        const token = auth.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // payload should contain user id and role (depends on your login implementation)
        req.userInfo = {
            _id: payload._id || payload.id || payload.userId,
            role: payload.role,
            name: payload.name,
            email: payload.email,
        };
        return next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const requireRole = (role) => (req, res, next) => {
    if (!req.userInfo) return res.status(401).json({ message: "Not authenticated" });
    if (Array.isArray(role)) {
        if (!role.includes(req.userInfo.role)) return res.status(403).json({ message: "Forbidden" });
    } else {
        if (req.userInfo.role !== role) return res.status(403).json({ message: "Forbidden" });
    }
    return next();
};

module.exports = { requireAuth, requireRole };
