const express = require('express');
const router = express.Router();

const { joinWaitlist, getCount, exportCSV } = require('../controllers/waitlistController');
const { waitlistValidationRules, validateInput } = require('../middleware/validateInput');
const { waitlistLimiter } = require('../middleware/rateLimiter');

// POST /api/waitlist — join the waitlist
router.post('/', waitlistLimiter, waitlistValidationRules, validateInput, joinWaitlist);

// GET /api/waitlist/count — public count for spot number display
router.get('/count', getCount);

// GET /api/waitlist/export — admin CSV export
router.get('/export', exportCSV);

module.exports = router;