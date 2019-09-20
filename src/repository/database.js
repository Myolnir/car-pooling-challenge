const mongoClient = require('mongodb').MongoClient;
const uuid = require('uuid');
module.exports = class Database {

  constructor ({config}) {
    this.config = config;

  }

  async createJourney ({logger}, journey) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const journeyWithProperUuid = Object.assign({}, journey, {id: uuid.v1()});
    const journeySaved = await dbClient.db('carPooling').collection('journeys')
      .insertOne(journeyWithProperUuid);
    dbClient.close();
    logger.info('End inserting journey into database');
    return journeySaved.ops[0];
  }

  async updateJourney ({logger}, journey, carId) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const query = {id: journey.id};
    const update = {$set: {car_id: carId, journey_initiated: new Date()}};
    const journeySaved = await dbClient.db('carPooling').collection('journeys')
      .findOneAndUpdate(query, update);
    logger.info('End updating journey into database');
    return journeySaved.value;

  }

  async findJourneysWithoutCarAssigned ({logger}) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    const journeys = await dbClient.db('carPooling').collection('journeys').find().toArray();
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
    const journey = await dbClient.db('carPooling').collection('journeys').findOne({id});
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
    const car = await dbClient.db('carPooling').collection('cars').findOne({id});
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
      await dbClient.db('carPooling').collection('journeys').deleteOne({id});
    } else {
      await dbClient.db('carPooling').collection('journeys').deleteMany({});
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
    const car = await dbClient.db('carPooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
    return car.value;
  }

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
    await dbClient.db('carPooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
  }

  async createCars ({logger}, cars) {
    const dbClient = await mongoClient
      .connect(this.config.mongo.url, {useUnifiedTopology: true, useNewUrlParser: true});
    await dbClient.db('carPooling').collection('cars').deleteMany({});
    await dbClient.db('carPooling')
      .collection('cars').insertMany(cars.map((car) => Object.assign({}, car, {locked: false}, {id: uuid.v1()})));
    dbClient.close();
    logger.info('End inserting cars list into database');
  }

};
