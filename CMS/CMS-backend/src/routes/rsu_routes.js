const express  = require("express");
const RSU      = require("../models/RSU");
const { requireApiKey, requireAuth } = require("../middleware/auth_middleware");

const router = express.Router();

// ── POST /api/rsu — register a new RSU ───────────────────────────────────────
router.post("/", requireApiKey, async (req, res) => {
  try {
    const rsu = await RSU.findOneAndUpdate(
      { rsuId: req.body.rsuId },
      { ...req.body, lastHeartbeat: new Date(), status: "online" },
      { upsert: true, new: true }
    );
    res.json({ message: "RSU registered", rsu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rsu — list all RSUs (dashboard) ─────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const rsus = await RSU.find();
    res.json(rsus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/rsu/heartbeat — RSU health ping ────────────────────────────────
// RSU firmware calls this every HEARTBEAT_MS (60 s)
router.post("/heartbeat", requireApiKey, async (req, res) => {
  try {
    const { rsuId, status = "ok", uptime_s } = req.body;
    if (!rsuId) return res.status(400).json({ error: "rsuId required" });

    await RSU.findOneAndUpdate(
      { rsuId },
      { lastHeartbeat: new Date(), status: "online" },
      { upsert: true }
    );

    console.log(`[RSU] Heartbeat from ${rsuId} — uptime ${uptime_s}s`);
    res.json({ message: "Heartbeat received" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rsu/key — OTA API key rotation ──────────────────────────────────
// RSU polls this every 5 min to check for a rotated API key
router.get("/key", requireApiKey, async (req, res) => {
  try {
    // Return current key — CMS operator updates RSU_API_KEY in .env to rotate
    // RSU receives { newKey: "..." } and stores it in NVS flash
    const newKey = process.env.RSU_API_KEY;
    res.json({ newKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
