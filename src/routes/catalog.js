const express = require('express');
const router = express.Router();
const container = require('../boot');

// Require controller modules.
const controller = container.resolve('controller');

router.get('/status', (req, res) => res.status(200).send());

router.post('/journey', controller.createJourney.bind(controller));

router.put('/cars', controller.createCars.bind(controller));

router.post('/locate', controller.locateGroup.bind(controller));

router.post('/dropoff', controller.dropOff.bind(controller));

module.exports = router;
