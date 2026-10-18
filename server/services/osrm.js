async function getRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service error');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) return null;
  const r = data.routes[0];
  return {
    distanceKm: Math.round(r.distance / 10) / 100,
    durationMin: Math.round(r.duration / 60),
    geometry: r.geometry
  };
}

module.exports = { getRoute };
