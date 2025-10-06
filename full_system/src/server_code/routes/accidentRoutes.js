const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { spawn } = require('child_process'); 

// --- Function to call the Python ML Microservice ---
const runMLPrediction = (payload) => {
    return new Promise((resolve, reject) => {
        // Run the Python script using the spawn command
        const pythonProcess = spawn('python3', [
            './src/server_code/ml_microservice/predict_severity.py'
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`ML script failed with code ${code}: ${error}`);
                // Fallback: If ML fails, use a safe, high-level default
                return resolve({ severity: 'warning', confidenceScore: 60 });
            }
            try {
                const mlOutput = JSON.parse(result);
                if (mlOutput.error) {
                    console.error("ML Error:", mlOutput.error);
                    return resolve({ severity: 'warning', confidenceScore: 60 }); 
                }
                resolve(mlOutput);
            } catch (e) {
                console.error('Failed to parse ML output:', result);
                resolve({ severity: 'warning', confidenceScore: 60 }); 
            }
        });

        // Pass the OBU payload to the Python script via stdin
        const mlPayload = {
            acc_delta: payload.acc_delta,
            gyro_delta: payload.gyro_delta,
            impact_time: payload.impact_time,
            airbag_deployed: payload.airbag_deployed,
            wheel_speed_drop_pct: payload.wheel_speed_drop_pct
        };
        pythonProcess.stdin.write(JSON.stringify(mlPayload));
        pythonProcess.stdin.end();
    });
};


// --- ENDPOINT I: POST /report (From OBU/RSU Gateway - EAM) ---
router.post('/report', async (req, res) => {
    try {
        const payload = req.body;
        
        // 1. Run the raw data through the ML Triage
        const { severity, confidenceScore } = await runMLPrediction(payload);

        const uniqueId = `INC-${Date.now()}-${payload.device_id.slice(-4)}`;

        const newIncident = new Incident({
            ...payload,
            incident_id: uniqueId,
            severity,
            confidenceScore,
            airbag_deployed: payload.airbag_deployed === 1,
            has_gps: payload.has_gps === 1,
        });

        await newIncident.save();

        res.status(201).json({ 
            message: 'Incident reported and processed', 
            incidentId: newIncident.incident_id, 
            severity: newIncident.severity 
        });
    } catch (error) {
        console.error('Error reporting incident:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- ENDPOINT II: GET / (To React Dashboard - Unchanged) ---
router.get('/', async (req, res) => {
    // ... (logic remains the same) ...
    try {
        const { status } = req.query;
        let filter = {};

        if (status) {
            const statusArray = status.split(',');
            filter.status = { $in: statusArray };
        }

        const incidents = await Incident.find(filter)
                                        .sort({ timestamp: -1 })
                                        .limit(100)
                                        .exec();

        res.json(incidents); 
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
