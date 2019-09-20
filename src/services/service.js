module.exports = class Service {
  constructor ({config, database}) {
    this.config = config;
    this.database = database;
  }

  async createJourney ({logger}, journey) {
    try{
      const availableCar = await this.database.getAvailableCarForPeople({logger}, journey.people);
      const journeySaved = await this.database.createJourney({ logger }, journey, availableCar);
      await this.database.updateCarForJourney({logger}, availableCar.id, journeySaved);
    } catch (err) {
      logger.error(err.message);
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
