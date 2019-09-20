const mongoClient = require('mongodb').MongoClient;
module.exports = class Database {

  constructor({ config }) {
    this.config = config;
  }

  async createJourney({logger}, journey) {
    const dbClient = await mongoClient.connect(this.config.mongo.url, { useUnifiedTopology: true, useNewUrlParser: true});
    await dbClient.db('carPooling').collection('journeys').insertOne(journey);
    dbClient.close();
    logger.info('End inserting journey into database');
  }

};