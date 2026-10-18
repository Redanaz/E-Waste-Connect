const router = require('express').Router();
const supabase = require('../config/supabase');
const { asyncHandler, must } = require('../utils/errors');

router.get('/', asyncHandler(async (req, res) => {
  res.json(must(await supabase.from('waste_categories').select('id,name').order('id')));
}));

module.exports = router;
