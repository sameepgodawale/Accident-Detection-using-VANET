// src/server_code/alerting_service/notifier.js

const twilio = require('twilio');
const nodemailer = require('nodemailer');
const templates = require('./templates');

// --- Twilio Setup ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// --- Email Setup ---
// NOTE: Use a dedicated service like SendGrid or configure a service provider (like Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or 'SendGrid', 'SMTP', etc.
    auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
    }
});

// --- Mock Emergency Contacts (Replace with database query for real data) ---
const getEmergencyContacts = () => ({
    hospital: process.env.HOSPITAL_PHONE,
    police: process.env.POLICE_EMAIL,
    driver_contact_phone: '+15551234567', // Driver's primary contact
    driver_contact_email: 'driver.family@example.com' 
});


/**
 * @brief Sends a high-priority SMS alert.
 */
const sendSmsAlert = async (to, body) => {
    try {
        await twilioClient.messages.create({
            body: body,
            from: twilioPhoneNumber,
            to: to
        });
        console.log(`SMS alert sent to ${to}`);
    } catch (error) {
        console.error(`ERROR sending SMS to ${to}:`, error.message);
    }
};

/**
 * @brief Sends a detailed email alert.
 */
const sendEmailAlert = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_SERVICE_USER,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`Email alert sent to ${to}`);
    } catch (error) {
        console.error(`ERROR sending email to ${to}:`, error.message);
    }
};


/**
 * @brief Main function to dispatch all notifications for a new incident.
 * @param {object} incident - The incident object processed by the ML model.
 */
const dispatchAlerts = async (incident) => {
    const contacts = getEmergencyContacts();
    const smsBody = templates.createEmergencySms(incident);
    const emailHtml = templates.createEmergencyEmail(incident);
    const subject = `CRITICAL ALERT: VANET Accident ID ${incident.incident_id}`;

    // 1. Notify Hospital (via SMS for speed)
    if (incident.severity !== 'minor') {
        sendSmsAlert(contacts.hospital, smsBody);
    }

    // 2. Notify Police Station (via Email for detailed dispatch info)
    sendEmailAlert(contacts.police, subject, emailHtml);

    // 3. Notify Driver's Emergency Contact (via SMS and Email)
    const driverSmsBody = `ALERT: Your contact ${incident.device_id} may be involved in a crash near ${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}. Check map link immediately.`;
    
    sendSmsAlert(contacts.driver_contact_phone, driverSmsBody);
    sendEmailAlert(contacts.driver_contact_email, `Urgent: Accident Alert for ${incident.device_id}`, emailHtml);

    // NOTE: Dashboard notifications happen automatically via the React Query refresh mechanism
};

module.exports = { dispatchAlerts };
