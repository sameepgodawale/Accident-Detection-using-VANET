const mongoose = require("mongoose");

const EmergencyServiceSchema = new mongoose.Schema({

  name: String,

  type: String, // hospital | police | fire

  telegramChatId: String,

  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [Number] // [lng, lat]
  }

});

EmergencyServiceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("EmergencyService", EmergencyServiceSchema);
