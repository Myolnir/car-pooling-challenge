const mongoClient = require('mongodb').MongoClient;
module.exports = class Database {

  constructor({ config }) {
    this.config = config;

  }

  async createJourney({logger}, journey, {id}) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    const journeySaved = await dbClient.db('carPooling').collection('journeys')
      .insertOne(Object.assign({}, journey, {car_id: id, journey_initiated: new Date()}));
    dbClient.close();
    logger.info('End inserting journey into database');
    return journeySaved.ops[0];
  }

  async deleteJourney({logger}) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    dbClient.db('carPooling').collection('journeys').deleteMany({});
    dbClient.close();
  }

  /**
   * Return the first available car with enough free seats for the journey and lock it to avoid another request gets the same car.
   * @param {*} param0
   * @param {minimun number of seats available} seats
   */
  async getAvailableCarForPeople({logger}, seats) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    const query = {
      journey_id:
        {
          $exists: false,
          locked: false,
        },
      seats:
        {
          $lte: seats
        }
    };
    const update = {$set: {locked: true}};
    const car = await dbClient.db('carPooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
    return car.value;
  }

  async updateCarForJourney({logger}, carId, {id, journey_initiated}) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    const query = {
      id: carId,
    };
    const update = {
        $set: {
          journey_id: id,
          journey_initiated,
        },
    };
    await dbClient.db('carPooling').collection('cars').findOneAndUpdate(query, update);
    dbClient.close();
  }

  async createCars({ logger }, cars) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true });
    await dbClient.db('carPooling').collection('cars').deleteMany({});
    await dbClient.db('carPooling').collection('cars').insertMany(cars.map((car) => {return Object.assign({}, car, {locked: false})}));
    dbClient.close();
    logger.info('End inserting cars list into database');
  }

};