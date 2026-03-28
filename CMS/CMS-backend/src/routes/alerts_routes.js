const express  = require("express");
const Accident = require("../models/Accident");
const { requireAuth } = require("../middleware/auth_middleware");

const router = express.Router();

// GET /api/alerts — all non-resolved (dashboard)
router.get("/", async (req, res) => {
  try {
    const alerts = await Accident.find({ status: { $ne: "resolved" } })
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/dispatch", requireAuth, async (req, res) => {
  try {
    const alert = await Accident.findByIdAndUpdate(
      req.params.id, { status: "dispatched" }, { new: true }
    );
    if (!alert) return res.status(404).json({ error: "Not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/acknowledge", requireAuth, async (req, res) => {
  try {
    const alert = await Accident.findByIdAndUpdate(
      req.params.id, { status: "acknowledged" }, { new: true }
    );
    if (!alert) return res.status(404).json({ error: "Not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve
router.patch("/:id/resolve", requireAuth, async (req, res) => {
  try {
    const alert = await Accident.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: "Not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
