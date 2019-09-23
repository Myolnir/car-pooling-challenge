const mongoClient = require('mongodb').MongoClient;
module.exports = class Database {

  constructor ({config}) {
    this.config = config;

  }

  /**
   * Creates a new journey into database, before it assign to the journey a uuid
   * @param logger
   * @param journey
   * @returns {Promise<*|Object>}
   */
  async createJourney ({logger}, journey) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const journeySaved = await dbClient.db('car_pooling').collection('journeys')
      .insertOne(journey);
    dbClient.close();
    return journeySaved.ops[0];
  }

  /**
   * Update a given journey.
   * @param logger
   * @param journey
   * @param carId
   * @returns {Promise<*>}
   */
  async updateJourney ({logger}, journey, carId) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const query = {id: journey.id};
    const update = {$set: {car_id: carId, journey_initiated: new Date()}};
    const journeySaved = await dbClient.db('car_pooling').collection('journeys')
      .findOneAndUpdate(query, update);
    dbClient.close();
    return journeySaved.value;

  }

  /**
   * Return all journeys that have not any car assigned.
   * @param logger
   * @returns {Promise<void>}
   */
  async findJourneysWithoutCarAssigned ({logger}) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const journeys = await dbClient.db('car_pooling').collection('journeys').find().toArray();
    dbClient.close();
    return journeys;

  }

  /**
   * Return a journey by its id.
   * @param logger
   * @param id of the journey
   * @returns {Promise<void>}
   */
  async findJourneyById ({logger}, id) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const journey = await dbClient.db('car_pooling').collection('journeys').findOne({id});
    dbClient.close();
    return journey;
  }

  /**
   * Return a car by its id
   * @param logger
   * @param id of the car
   * @returns {Promise<void>}
   */
  async findCarById ({logger}, id) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const car = await dbClient.db('car_pooling').collection('cars').findOne({id});
    dbClient.close();
    return car;
  }

  /**
   * Delete one or all elements of journeys collection.
   * @param {*} param0
   * @param {*} id optional parameter if not informed we delete all data of journeis.
   */
  async deleteJourney ({logger}, id) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    if (id) {
      await dbClient.db('car_pooling').collection('journeys').deleteOne({id});
    } else {
      await dbClient.db('car_pooling').collection('journeys').deleteMany({});
    }

    dbClient.close();
  }

  /**
   * Return the first available car with enough free seats for the journey that there is not locked.
   * @param {*} param0
   * @param {minimun number of seats available} seats
   */
  async getAvailableCarForPeople ({logger}, neededSeats) {
    logger.info(`Checking if is there any available car with ${neededSeats} seats`);
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const query = {
      locked: false,
      $and: [
        {seats: {$ne: 0}},
        {seats: {$gte: neededSeats}},
      ],
    };
    const update = {$set: {locked: true}};
    const car = await dbClient.db('car_pooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
    return car.value;
  }

  /**
   * Update a car for a new journey, update its available seats and add the journey to the journeys of the car.
   * @param logger
   * @param carId
   * @param journeyId
   * @param remainingSeats
   * @param dropOff
   * @returns {Promise<void>}
   */
  async updateCarForJourney ({logger}, carId, journeyId, remainingSeats, dropOff) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const query = {
      id: carId,
    };
    let update = {
      $set: {
        locked: false,
        seats: remainingSeats,
      },
    };
    update = dropOff
      ? Object.assign({}, update, {$pull: {journeys: {journey_id: journeyId}}})
      : Object.assign({}, update, {$push: {journeys: {journey_id: journeyId}}});
    await dbClient.db('car_pooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
  }

  /**
   * Create cars into database.
   * @param logger
   * @param cars
   * @returns {Promise<void>}
   */
  async createCars ({logger}, cars) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    await dbClient.db('car_pooling').collection('cars').deleteMany({});
    await dbClient.db('car_pooling')
      .collection('cars').insertMany(cars.map((car) => Object.assign({}, car, {locked: false})));
    dbClient.close();
  }

  async removeCarFromJourney({logger}, journeyId) {
    const dbClient = await mongoClient 
      .connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    const query = {id: journeyId};
    const update = {$unset: {car_id: '', journey_initiated: ''}};
    await dbClient.db('car_pooling').collection('journeys').findOneAndUpdate(query, update);
    dbClient.close();
  }

};
