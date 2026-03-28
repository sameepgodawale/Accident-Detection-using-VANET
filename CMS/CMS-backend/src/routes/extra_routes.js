const express = require("express");
const router = express.Router();

// fake mark read
router.post("/:id/read", (req, res) => {
  res.json({ success: true });
});

// fake logs
router.get("/transit-logs", (req, res) => {
  res.json([]);
});

module.exports = router;
