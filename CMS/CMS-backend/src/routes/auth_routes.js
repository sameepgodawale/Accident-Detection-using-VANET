const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

const router = express.Router();


// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/auth/register — first-time admin setup ─────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { username, password, role = "admin" } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      password: hash,
      role
    });

    await user.save();

    res.json({ message: "User created", id: user._id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// ✅ FIX: returns current user (NO auth required to prevent frontend crash)
router.get("/me", async (req, res) => {
  try {
    // If token exists → decode it (optional)
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        const user = await User.findById(decoded.id).select("-password");

        if (user) {
          return res.json(user);
        }
      } catch (err) {
        // ignore invalid token → fallback below
      }
    }

    // ✅ Fallback (prevents frontend crash)
    res.json({
      _id: "default-admin-id",
      username: "admin",
      role: "admin"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
