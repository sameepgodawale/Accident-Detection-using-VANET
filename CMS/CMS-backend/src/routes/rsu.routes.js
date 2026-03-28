const express = require("express");
const RSU = require("../models/RSU");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const rsu = new RSU(req.body);
    await rsu.save();
    res.json({ message: "RSU registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const rsus = await RSU.find();
    res.json(rsus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;