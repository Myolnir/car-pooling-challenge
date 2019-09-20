module.exports = class Service {
  constructor ({config, database}) {
    this.config = config;
    this.database = database;
  }

  /**
   * We will create a new journey.
   * We check if there are any car available for the number of people for the journey, if yes,
   * we assign the car to this journey and
   * @param logger
   * @param journey
   * @returns {Promise<void>}
   */
  async createJourney ({logger}, journey) {
    try{
      const availableCar = await this.database.getAvailableCarForPeople({logger}, journey.people);
      if (availableCar) {
        logger.debug('We have the car %s available for the journey', availableCar.id);
        const journeySaved = await this.database.createJourney({ logger }, journey, availableCar.id);
        const remainingSeats = availableCar.seats-journeySaved.people;
        await this.database.updateCarForJourney({logger}, availableCar.id, journeySaved, remainingSeats);
      } else{
        logger.warn('We do not have any available car for the journey, we create the journey without assigned car');
        await this.database.createJourney({ logger }, journey, null);
      }
    } catch (err) {
      logger.error(err.message);
      //TODO eliminar el journey recien creado y dejar el car como estaba en un principio (availableCar)
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
