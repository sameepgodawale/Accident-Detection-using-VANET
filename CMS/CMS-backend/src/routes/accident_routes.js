const express = require("express");
const axios   = require("axios");

const Accident          = require("../models/Accident");
const findNearest       = require("../utils/findNearest");
const sendAlert         = require("../utils/sendalert");
const sendTelegramAlert = require("../utils/sendTelegramAlert");
const { requireApiKey } = require("../middleware/auth_middleware");

const router = express.Router();

// ── Reverse geocode lat/lon → address ──
async function reverseGeocode(lat, lon) {
  try {
    const resp = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { timeout: 5000, headers: { "User-Agent": "VANET-CMS/1.0" } }
    );
    return resp.data.display_name || "";
  } catch {
    return "";
  }
}

// ── POST /api/accidents ──
router.post("/", requireApiKey, async (req, res) => {
  try {
    const body = req.body;

    const latitude  = body.latitude  || body.lat;
    const longitude = body.longitude || body.lon;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing GPS coordinates" });
    }

    const vehicleId = body.vid || body.vehicleId || "UNKNOWN";

    let severity   = "UNKNOWN";
    let confidence = 0;

    // ── ML FEATURES ──
    const mlFeatures = body.features || {
      acc_delta:            body.acc   || 0,
      gyro_delta:           body.gyro  || 0,
      vibration_intensity:  body.vib   || 0,
      impact_duration:      body.idur  || 0,
      airbag_deployed:      body.abag  || 0,
      wheel_speed_drop_pct: body.wdrop || 0,
      thermal_c:            body.temp  || 0,
      latitude,
      longitude,
      initial_speed:        body.spd   || 0,
      imu_consistency:      body.cons  || 0
    };

    // ── ML CALL ──
    if (process.env.ML_SERVICE_URL) {
      try {
        const mlResp = await axios.post(
          process.env.ML_SERVICE_URL + "/predict",
          mlFeatures,
          { timeout: 30000 }
        );
        severity   = mlResp.data.severity   || "UNKNOWN";
        confidence = mlResp.data.confidence || 0;
      } catch (err) {
        console.error("[ML] Failed:", err.message);
      }
    }

    // ── GEO ──
    const address = await reverseGeocode(latitude, longitude);

    // ── CREATE OBJECT ──
    const accident = new Accident({
      rsuId:       body.rsuId,
      vehicleId,
      latitude,
      longitude,
      address,
      severity,
      confidence,
      description: body.description,
      status:      "open",
      features:    mlFeatures,
      eam: {
        acc:   body.acc,
        gyro:  body.gyro,
        a6050: body.a6050,
        a9250: body.a9250,
        cons:  body.cons,
        idur:  body.idur,
        vib:   body.vib,
        temp:  body.temp,
        abag:  body.abag,
        wdrop: body.wdrop,
        spd:   body.spd,
        hh:    body.hh,
        mm:    body.mm,
        ss:    body.ss
      }
    });

    // ── SAVE ──
    await accident.save();
    console.log("[CMS] Saved:", accident._id);

    // ── REAL-TIME BROADCAST ──
    if (global.broadcast) {
      global.broadcast({
        type: "NEW_ACCIDENT",
        data: accident
      });
    }

    // ── FIND SERVICES ──
    let nearestServices = [];
    try {
      nearestServices = await findNearest(latitude, longitude);
    } catch (err) {
      console.error("[CMS] Geo error:", err.message);
    }

    // ── ALERTS ──
    for (const service of nearestServices) {
      try {
        await sendAlert(service, accident);
      } catch (err) {
        console.error("[CMS] Alert error:", err.message);
      }
    }

    // ── TELEGRAM ──
    try {
      await sendTelegramAlert(accident);
    } catch (err) {
      console.error("[CMS] Telegram error:", err.message);
    }

    // ── RESPONSE ──
    res.json({
      message: "Accident processed successfully",
      id: accident._id,
      severity,
      address,
      notified: nearestServices.length
    });

  } catch (err) {
    console.error("[CMS] ERROR:", err);
    res.status(500).json({ error: "Accident processing failed" });
  }
});

// ── GET /api/accidents ──
router.get("/", async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { vehicleId: { $regex: search, $options: "i" } },
        { severity:  { $regex: search, $options: "i" } },
        { address:   { $regex: search, $options: "i" } }
      ];
    }

    const accidents = await Accident.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json(accidents);

  } catch (err) {
    console.error("[CMS] Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch accidents" });
  }
});

// ── PATCH /api/accidents/:id/resolve ──
router.patch("/:id/resolve", async (req, res) => {
  try {
    const accident = await Accident.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );

    if (!accident) return res.status(404).json({ error: "Not found" });

    res.json(accident);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
