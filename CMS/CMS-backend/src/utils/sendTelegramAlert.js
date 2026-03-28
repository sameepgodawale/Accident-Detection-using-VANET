const axios = require("axios");

async function sendTelegramAlert(accident) {

  try {

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Telegram config missing");
      return;
    }

    const mapLink = `https://maps.google.com/?q=${accident.latitude},${accident.longitude}`;

    const message = `
🚨 VANET ACCIDENT ALERT 🚨

Vehicle ID: ${accident.vehicleId}

Severity: ${accident.severity}

📍 Location:
Lat: ${accident.latitude}
Lon: ${accident.longitude}

🗺 Open in Maps:
${mapLink}

⏱ Time:
${new Date().toLocaleString()}
`;

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message
      }
    );

    console.log("✅ Telegram alert sent");

  } catch (error) {

    console.error("❌ Telegram error:", error.response?.data || error.message);

  }

}

module.exports = sendTelegramAlert;
