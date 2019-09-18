const logger = require('../util/logger');
const httpStatusCodes = require('http-status-codes');
module.exports = class Controller {

  constructor ({service}) {
    this.service = service;
  }

  async post (req, res) {
    logger.info('Post method');
    // TODO 
  }


};
