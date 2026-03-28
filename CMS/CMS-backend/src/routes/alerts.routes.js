const express = require("express");
const Accident = require("../models/Accident");

const router = express.Router();

/* GET all active alerts */
router.get("/", async (req, res) => {
  try {
    const alerts = await Accident.find({ status: { $ne: "resolved" } })
      .sort({ timestamp: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* dispatch alert */
router.patch("/:id/dispatch", async (req, res) => {
  try {
    const alert = await Accident.findByIdAndUpdate(
      req.params.id,
      { status: "dispatched" },
      { new: true }
    );

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* acknowledge alert */
router.patch("/:id/acknowledge", async (req, res) => {
  try {
    const alert = await Accident.findByIdAndUpdate(
      req.params.id,
      { status: "acknowledged" },
      { new: true }
    );

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
