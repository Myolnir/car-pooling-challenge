require('dotenv').config();
const {createContainer, asClass, asValue} = require('awilix');

// Controllers
const controller = require('./controllers/controller');

// services
const service = require('./services/service');

const config = require('./config');

const container = createContainer();

module.exports = container.register({
  controller: asClass(controller).singleton(),
  config: asValue(config),
  service: asClass(service).singleton(),
});
