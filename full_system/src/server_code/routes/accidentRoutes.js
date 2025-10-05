const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// --- Core Logic: Triage & Severity Calculation ---
const calculateTriage = (payload) => {
    let severity = 'minor';
    let confidenceScore = 50; // Base confidence

    const { acc_delta, gyro_delta, wheel_speed_drop_pct, airbag_deployed } = payload;
    
    // Rule 1: Airbag Deployment -> CRITICAL
    if (airbag_deployed === 1) {
        severity = 'critical';
        confidenceScore = Math.min(100, confidenceScore + 30);
    }
    
    // Rule 2: High Deceleration
    if (acc_delta >= 10.0) { 
        severity = severity === 'critical' ? 'critical' : 'warning';
        confidenceScore = Math.min(100, confidenceScore + 20);
    } else if (acc_delta >= 5.0) {
        confidenceScore = Math.min(100, confidenceScore + 10);
    }

    // Rule 3: Major Speed Drop
    if (wheel_speed_drop_pct >= 80) { 
        severity = severity === 'critical' ? 'critical' : 'warning';
        confidenceScore = Math.min(100, confidenceScore + 20);
    }

    // Rule 4: High Roll/Spin
    if (gyro_delta > 150) { 
        severity = 'critical';
        confidenceScore = Math.min(100, confidenceScore + 10);
    }

    // Final adjustment based on confidence
    if (confidenceScore >= 90) severity = 'critical';
    else if (confidenceScore >= 70) severity = 'warning';
    
    return { severity, confidenceScore };
};

// --- ENDPOINT I: POST /report (From OBU Device) ---
router.post('/report', async (req, res) => {
    try {
        const payload = req.body;
        
        // 1. Run the raw data through the triage logic
        const { severity, confidenceScore } = calculateTriage(payload);

        // 2. Create the new incident document
        const newIncident = new Incident({
            ...payload,
            severity,
            confidenceScore,
            // Convert C int (1/0) to JS Boolean
            airbag_deployed: payload.airbag_deployed === 1,
            has_gps: payload.has_gps === 1,
        });

        // 3. Save to MongoDB
        await newIncident.save();

        res.status(201).json({ 
            message: 'Incident reported and processed', 
            incidentId: newIncident._id, 
            severity: newIncident.severity 
        });
    } catch (error) {
        console.error('Error reporting incident:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- ENDPOINT II: GET / (To React Dashboard) ---
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        // Build the MongoDB query filter based on the URL parameter
        if (status) {
            const statusArray = status.split(',');
            filter.status = { $in: statusArray };
        }

        // Fetch incidents, sort by timestamp (newest first)
        const incidents = await Incident.find(filter)
                                        .sort({ timestamp: -1 })
                                        .limit(100)
                                        .exec();

        // Mongoose automatically includes the 'location' virtual field when using .toJSON()
        const dashboardLogs = incidents.map(incident => incident.toJSON());

        res.json(dashboardLogs);

    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
