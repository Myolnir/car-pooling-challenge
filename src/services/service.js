module.exports = class Service {
  constructor ({config, database}) {
    this.config = config;
    this.database = database;
  }

  async createJourney ({logger}, journey) {
    try{
      await this.database.createJourney({ logger }, journey);  
    } catch (err) {
        throw new Error('Error inserting a new Journey');
    }
  }

  async createCars({ logger }, cars) {
    try {
      await this.database.deleteJourney({logger});
      await this.database.createCars({ logger }, cars);
    } catch (err) {
      logger.error(err.message);
      throw new Error('Error inserting a new list of cars');
    }
  }
};
