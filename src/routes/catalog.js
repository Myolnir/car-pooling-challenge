const container = require('../boot');

// Require controller modules.
const controller = container.resolve('controller');

module.exports = (server) => {
  server.get('/status', (req, res, next) => {
    res.status(200);
    res.send();
  });
  server.post('/journey', controller.createJourney.bind(controller));
  server.put('/cars', controller.createCars.bind(controller));
  server.post('/locate', controller.locateGroup.bind(controller));
  server.post('/dropoff', controller.dropOff.bind(controller));
};
