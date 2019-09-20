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
};
