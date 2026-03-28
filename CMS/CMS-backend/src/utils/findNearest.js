const EmergencyService = require("../models/EmergencyService");

// Use MongoDB $nearSphere (2dsphere index) for efficient geo queries.
// Falls back to Haversine if geo index not available.
async function findNearest(latitude, longitude) {
  if (!latitude || !longitude) throw new Error("Invalid coordinates");

  try {
    // MongoDB native geo query — fastest, uses 2dsphere index on EmergencyService
    const services = await EmergencyService.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 50000  // 50 km radius
        }
      }
    }).limit(10);

    // Pick nearest of each type
    const result = { hospital: null, police: null, fire: null };
    for (const svc of services) {
      if (!result[svc.type]) result[svc.type] = svc;
    }
    return Object.values(result).filter(Boolean);

  } catch (err) {
    // Fallback: Haversine in-memory sort (works without 2dsphere index)
    console.warn("[GEO] $nearSphere failed, using Haversine fallback:", err.message);
    return findNearestFallback(latitude, longitude);
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findNearestFallback(latitude, longitude) {
  const services = await EmergencyService.find();
  const enriched = services.map(s => {
    if (!s.location?.coordinates) return null;
    const [lon, lat] = s.location.coordinates;
    return { ...s.toObject(), distance: haversine(latitude, longitude, lat, lon) };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance);

  const result = { hospital: null, police: null, fire: null };
  for (const svc of enriched) {
    if (!result[svc.type]) result[svc.type] = svc;
  }
  return Object.values(result).filter(Boolean);
}

module.exports = findNearest;
