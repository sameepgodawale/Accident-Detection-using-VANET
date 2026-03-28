function generateMapLink(lat, lon) {
  return `https://maps.google.com/?q=${lat},${lon}`;
}

module.exports = generateMapLink;