const router = require('express').Router();
const { geocode } = require('../services/nominatim');
const { getRoute } = require('../services/osrm');
const { HttpError, asyncHandler } = require('../utils/errors');

router.get('/geocode', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) throw new HttpError(400, 'q is required');
  const result = await geocode(/^\d{6}$/.test(q) ? `${q}, India` : q);
  if (!result) throw new HttpError(404, 'Location not found');
  res.json(result);
}));

router.get('/route', asyncHandler(async (req, res) => {
  const [fromLat, fromLng, toLat, toLng] = ['fromLat', 'fromLng', 'toLat', 'toLng'].map((k) => parseFloat(req.query[k]));
  if ([fromLat, fromLng, toLat, toLng].some(isNaN)) throw new HttpError(400, 'fromLat, fromLng, toLat and toLng are required');
  const route = await getRoute(fromLat, fromLng, toLat, toLng);
  if (!route) throw new HttpError(404, 'No route found');
  res.json(route);
}));

module.exports = router;
