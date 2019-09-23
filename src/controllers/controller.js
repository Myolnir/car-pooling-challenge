const logger = require('../util/logger');
const httpStatusCodes = require('http-status-codes');
module.exports = class Controller {

  constructor ({service}) {
    this.service = service;
  }

  async createJourney (req, res) {
    logger.info('Post method');
    if (req.body === undefined || req.body === null || req.headers['content-type'] !== 'application/json') {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Your payload or headers are not correct',
      }).end();
    }
    try {
      const journey = req.body;
      await this.service.createJourney({logger}, journey);
      res.status(httpStatusCodes.OK);
      res.send().end();
    } catch (err) {
      logger.error(err.message);
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: err.message,
      }).end();
    }
  }

  async createCars (req, res) {
    if (req.body === undefined || req.body === null || req.headers['content-type'] !== 'application/json') {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Your payload or headers are not correct',
      }).end();
    }
    try {
      const cars = req.body;
      await this.service.createCars({logger}, cars);
      res.status(httpStatusCodes.OK);
      res.send().end();
    } catch (err) {
      logger.error(err.message);
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: err.message,
      }).end();
    }
  }

  async locateGroup (req, res) {
    if (req.body === undefined || req.body === null || req.body.ID === undefined || req.body.ID === null) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Your payload or headers are not correct',
      }).end();
    }
    try {
      const groupId = req.body.ID;
      const car = await this.service.locateGroup({logger}, groupId);
      if (Object.keys(car).length === 0) {
        res.status(httpStatusCodes.NO_CONTENT);
      } else {
        res.status(httpStatusCodes.OK);
      }
      res.send(car).end();
    } catch (err) {
      logger.error(err.message);
      res.status(err.code);
      res.send({
        error: err.message,
      }).end();
    }
  }

  async dropOff (req, res) {
    if (req.body === undefined || req.body === null || req.body.ID === undefined || req.body.ID === null) {
      res.status(httpStatusCodes.BAD_REQUEST);
      res.send({
        error: 'Your payload or headers are not correct',
      }).end();
    }
    try {
      const groupId = req.body.ID;
      await this.service.dropOff({logger}, groupId);
      res.status(httpStatusCodes.NO_CONTENT);
      res.send().end();
    } catch (err) {
      logger.error(err.message);
      res.status(err.code);
      res.send({
        error: err.message,
      }).end();
    }
  }

};
