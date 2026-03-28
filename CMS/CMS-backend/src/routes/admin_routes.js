const express = require("express");
const User    = require("../models/User");
const { requireAuth } = require("../middleware/auth_middleware");

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
