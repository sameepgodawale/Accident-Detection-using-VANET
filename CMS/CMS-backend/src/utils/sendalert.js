const axios          = require("axios");
const generateMapLink = require("./mapLink");

async function sendAlert(service, accident) {
  const token   = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !service.telegramChatId) {
    console.warn(`[Alert] Skipping ${service.name} — no Telegram config`);
    return;
  }

  const mapLink = generateMapLink(accident.latitude, accident.longitude);

  const eam = accident.eam || {};
  const message = [
    "🚨 EMERGENCY ALERT 🚨",
    "",
    `Service  : ${service.name} (${service.type})`,
    `Vehicle  : ${accident.vehicleId || "Unknown"}`,
    `Severity : ${accident.severity} (${Math.round((accident.confidence || 0) * 100)}%)`,
    "",
    `📍 Location: ${mapLink}`,
    `⚡ Impact  : ${eam.acc?.toFixed(1) || "?"} m/s²  |  Gyro: ${eam.gyro?.toFixed(0) || "?"}°/s`,
    `🌡 Temp    : ${eam.temp?.toFixed(1) || "?"}°C  |  Airbag: ${eam.abag ? "YES ⚠️" : "No"}`,
    `⏱ Time    : ${new Date().toLocaleString()}`
  ].join("\n");

  await axios.post(
    `https://api.telegram.org/bot${token}/sendMessage`,
    { chat_id: service.telegramChatId, text: message }
  );
  console.log(`[Alert] Sent to ${service.name}`);
}

module.exports = sendAlert;
