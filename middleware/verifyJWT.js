const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ message: "Unauthorized" });

  const token = auth.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Forbidden" });
    req.user = decoded;
    next();
  });
};

module.exports = verifyJWT;
