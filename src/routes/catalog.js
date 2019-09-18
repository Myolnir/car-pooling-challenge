const express = require('express');
const router = express.Router();
const container = require('../boot');

// Require controller modules.
const controller = container.resolve('controller');

// Status endpoint
router.get('/status', (req, res) => res.status(200).send());
module.exports = router;
