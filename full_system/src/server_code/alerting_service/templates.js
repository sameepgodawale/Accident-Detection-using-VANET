// src/server_code/alerting_service/templates.js

const getMapLink = (lat, lon) => {
    // Generates a link to Google Maps showing the incident location
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
};

/**
 * Creates the critical SMS message content for Emergency Services.
 * @param {object} incident - The processed incident object.
 */
const createEmergencySms = (incident) => {
    const link = getMapLink(incident.lat, incident.lon);
    
    return `VANET ALERT: ${incident.severity.toUpperCase()} ACCIDENT detected. 
    ID: ${incident.incident_id}. 
    Loc: ${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}. 
    Severity: ${incident.confidenceScore}% confidence. 
    MAP: ${link}`;
};

/**
 * Creates the email content for dispatch centers.
 * @param {object} incident - The processed incident object.
 */
const createEmergencyEmail = (incident) => {
    const link = getMapLink(incident.lat, incident.lon);

    return `
    <html>
    <body style="font-family: sans-serif; background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 8px; border-top: 5px solid #dc2626;">
            <h2 style="color: #dc2626;">EMERGENCY DISPATCH REQUIRED</h2>
            <p style="font-size: 1.2em; font-weight: bold;">Severity: ${incident.severity.toUpperCase()} (${incident.confidenceScore}% CONFIDENCE)</p>
            
            <p><strong>Incident ID:</strong> ${incident.incident_id}</p>
            <p><strong>Vehicle ID:</strong> ${incident.device_id}</p>
            <p><strong>Airbag Status:</strong> ${incident.airbag_deployed ? 'DEPLOYED (HIGH RISK)' : 'NOT DEPLOYED'}</p>
            <p><strong>Time:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
            
            <a href="${link}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
                VIEW LIVE LOCATION ON MAP
            </a>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Dispatch the nearest unit immediately. This alert was machine-classified.</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = { createEmergencySms, createEmergencyEmail, getMapLink };
