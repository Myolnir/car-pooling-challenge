const httpStatusCodes = require('http-status-codes');

function createNotFoundError (id) {
  const error = new Error(`The journey with this id ${id} does not exists`);
  error.code = httpStatusCodes.NOT_FOUND;
  return error;
}

module.exports = class Service {
  constructor ({config, database}) {
    this.config = config;
    this.database = database;
  }

  /**
   * Private function that checks for a given journey if there is an available car, if yes, asign the car to the journey and update it.
   * @param {*} param0
   * @param {*} journey
   */
  async _checkIfCanAssignACar ({logger}, journey) {
    const availableCar = await this.database.getAvailableCarForPeople({logger}, journey.people);
    if (availableCar) {
      logger.info(`We have the car ${availableCar.id} available for the journey`);
      const journeySaved = await this.database.updateJourney({logger}, journey, availableCar.id);
      const remainingSeats = availableCar.seats - journeySaved.people;
      await this.database.updateCarForJourney({logger}, availableCar.id, journeySaved.id, remainingSeats, false);
    }
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
    try {
      const journeyCreated = await this.database.createJourney({logger}, journey, null);
      await this._checkIfCanAssignACar({logger}, journeyCreated);
    } catch (err) {
      logger.error(err.message);
      throw new Error('Error inserting a new Journey');
    }
  }

  /**
   * Retries all journeys without car assigned, this will happen when a journey has finished by a dropOff.
   * On the first approach of my service I assume that when we drop off a journey those people are deleted from the database
   * once deleted I tried to assign the car that just to drop off people to assign to other people, with the approach
   * of only remove the car from journey object I cannot do that.
   * To enable again this functionality you just to uncomment from dropOff function the two commented lines and comment the 
   * line await this.database.removeCarFromJourney({logger}, journey.id);
   * @param {*} param0
   */
  async retryJourneysWithoutCarsAssigned ({logger}) {
    const journeys = await this.database.findJourneysWithoutCarAssigned({logger});
    for (const journey of journeys) {
      await this._checkIfCanAssignACar({logger}, journey);
    }

  }

  async createCars ({logger}, cars) {
    try {
      await this.database.deleteJourney({logger});
      await this.database.createCars({logger}, cars);
    } catch (err) {
      logger.error(err.message);
      throw new Error('Error inserting a new list of cars');
    }
  }

  async locateGroup ({logger}, groupId) {
    const journey = await this.database.findJourneyById({logger}, groupId);
    if (journey) {
      if (journey.car_id) {
        return this.database.findCarById({logger}, journey.car_id);
      }
      return {};
    } else {
      logger.error(`The journey with this id ${groupId} does not exists`);
      throw createNotFoundError(groupId);
    }
  }

  /**
   * Drops off an existing journey, after drop off update the car with the new available seats and journeys.
   * @param logger
   * @param groupId
   * @returns {Promise<void>}
   */
  async dropOff ({logger}, groupId) {
    const journey = await this.database.findJourneyById({logger}, groupId);
    if (journey) {
      //await this.database.deleteJourney({logger}, journey.id);
      await this.database.removeCarFromJourney({logger}, journey.id);
      if (journey.car_id) {
        const car = await this.database.findCarById({logger}, journey.car_id);
        const remainingSeats = car.seats + journey.people;
        await this.database.updateCarForJourney({logger}, car.id, journey.id, remainingSeats, true);
        //await this.retryJourneysWithoutCarsAssigned({logger});
      }
    } else {
      logger.error(`The journey with this id ${groupId} does not exists`);
      throw createNotFoundError(groupId);
    }
  }
};
