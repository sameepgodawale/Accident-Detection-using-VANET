const express = require("express");
const router = express.Router();
const Accident = require("../models/Accident");

router.get("/", async (req, res) => {
  try {
    const accidents = await Accident.find().sort({ createdAt: -1 });

    const notifications = accidents
      .filter(Boolean) // ✅ REMOVE undefined
      .map(acc => ({
        id: acc._id?.toString(),
        type: "alert",
        title: "Accident Detected",
        description: `Severity: ${acc.severity || "unknown"}`,
        timestamp: acc.createdAt || new Date(),
        read: false
      }));

    res.json(notifications);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
