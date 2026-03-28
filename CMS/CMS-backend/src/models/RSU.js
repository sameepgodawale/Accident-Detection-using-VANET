const mongoose = require("mongoose");

const RSUSchema = new mongoose.Schema({
  rsuId:         { type: String, required: true, unique: true },
  location:      String,
  status:        { type: String, default: "online" },
  lastHeartbeat: Date,
  apiKey:        String    // hashed API key for per-RSU auth (future use)
});

module.exports = mongoose.model("RSU", RSUSchema);
