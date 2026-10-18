const UA = 'EWasteConnect/1.0 (college project)';
let last = 0;

// Nominatim policy: max 1 request per second
async function throttle() {
  const wait = last + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
}

async function geocode(query) {
  await throttle();
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=' + encodeURIComponent(query);
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocoding service error');
  const results = await res.json();
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), displayName: results[0].display_name };
}

module.exports = { geocode };
