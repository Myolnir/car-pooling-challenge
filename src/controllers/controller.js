const logger = require('../util/logger');
const httpStatusCodes = require('http-status-codes');
module.exports = class Controller {

  constructor ({service}) {
    this.service = service;
  }

  async createJourney (req, res) {
    logger.info('Post method');
    if (req.body === undefined || req.body === null) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Payload is required and must be an object',
      }).end();
    }
    try {
      const journey = req.body;
      await this.service.createJourney({ logger }, journey);
      res.status(httpStatusCodes.OK);
      res.send().end();
    } catch (err) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: err.message,
      }).end();
    }
  }

  async createCars(req, res) {
    if (req.body === undefined || req.body === null) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Payload is required and must be an object',
      }).end();
    }
    try {
      const cars = req.body;
      await this.service.createCars({ logger }, cars);
      res.status(httpStatusCodes.OK);
      res.send().end();
    } catch (err) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: err.message,
      }).end();
    }
  }



};
