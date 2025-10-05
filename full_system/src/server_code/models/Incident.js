const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    // --- Data received directly from OBU (event_payload_t) ---
    device_id: { type: String, required: true, index: true },
    acc_delta: { type: Number, required: true },
    gyro_delta: { type: Number, required: true },
    impact_time: { type: Number },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    has_gps: { type: Boolean, default: true },
    airbag_deployed: { type: Boolean, default: false },
    wheel_speed_before: { type: Number },
    wheel_speed_after: { type: Number },
    wheel_speed_drop_pct: { type: Number },
    
    // --- Data CALCULATED by the CMS/Backend ---
    timestamp: { type: Date, default: Date.now, index: true },
    severity: { type: String, enum: ['minor', 'warning', 'critical'], default: 'minor' },
    confidenceScore: { type: Number, default: 0 },
    
    // --- Data MANAGED by the Operator (Dashboard) ---
    status: { type: String, enum: ['pending', 'acknowledged', 'verified', 'resolved'], default: 'pending', index: true },
    dispatchedUnits: { type: [String], default: [] },
    notes: { type: String, default: '' },
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

IncidentSchema.virtual('location').get(function() {
    return { lat: this.lat, lng: this.lon };
});

module.exports = mongoose.model('Incident', IncidentSchema);
