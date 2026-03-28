const jwt = require("jsonwebtoken");

// JWT auth — for dashboard users
module.exports.requireAuth = (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) return res.status(401).json({ msg: "No token provided" });

  // Strip "Bearer " prefix if present
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// API key auth — for RSU hardware devices
module.exports.requireApiKey = (req, res, next) => {
  const key = req.header("x-api-key");
  if (!key) return res.status(401).json({ msg: "Missing x-api-key header" });
  if (key !== process.env.RSU_API_KEY) return res.status(403).json({ msg: "Invalid API key" });
  next();
};
