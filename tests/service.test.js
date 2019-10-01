const Service = require('../src/services/service');
const logger = require('../src/util/logger');
const config = require('../src/config');
const uuid = require('uuid');

describe('car pool service tests', () => {
  const car = {
    'id': '57550160-dbd0-11e9-a12c-ad42b04eeec7',
    'seats': 6,
    'locked': false,
  };
  const journey = {
    'id': '57550160-dbd0-11e9-a12c-ad42b04eeec7',
    'people': 2,
  };
  const journeyWithCar = {
    'id': '67550160-dbd0-11e9-a12c-ad42b04eeec7',
    'people': 2,
    'car_id': '57550160-dbd0-11e9-a12c-ad42b04eeec7',
  };


  let service;
  const database = {
    createJourney: jest.fn(),
    getAvailableCarForPeople: jest.fn(),
    updateJourney: jest.fn(),
    updateCarForJourney: jest.fn(),
    deleteJourney: jest.fn(),
    createCars: jest.fn(),
    findJourneyById: jest.fn(),
    findCarById: jest.fn(),
    findJourneysWithoutCarAssigned: jest.fn(),
    removeCarFromJourney: jest.fn(),
  };
  beforeEach(() => {
    service = new Service({config, database});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create journey tests', () => {
    it('should create a journey with available cars with enough seats', async () => {
      database.createJourney.mockReturnValueOnce({
        id: uuid.v1(),
        people: 6,
      });
      database.getAvailableCarForPeople.mockReturnValueOnce(car);
      database.updateJourney.mockReturnValueOnce(journey);
      await service.createJourney({logger}, journey);
      expect(database.createJourney).toHaveBeenCalledTimes(1);
      expect(database.getAvailableCarForPeople).toHaveBeenCalledTimes(1);
      expect(database.updateJourney).toHaveBeenCalledTimes(1);
      expect(database.updateCarForJourney).toHaveBeenCalledTimes(1);
    });
    it('should create a journey without car assigned when there is no available car with enough seats', async () => {
      database.createJourney.mockReturnValueOnce({
        id: uuid.v1(),
        people: 6,
      });
      database.getAvailableCarForPeople.mockReturnValueOnce(null);
      database.updateJourney.mockReturnValueOnce(journey);
      service = new Service({config, database});
      await service.createJourney({logger}, journey);
      expect(database.createJourney).toHaveBeenCalledTimes(1);
      expect(database.getAvailableCarForPeople).toHaveBeenCalledTimes(1);
      expect(database.updateJourney).toHaveBeenCalledTimes(0);
      expect(database.updateCarForJourney).toHaveBeenCalledTimes(0);
    });
  });

  describe('create cars tests', () => {
    it('should create cars into database and delete existing journeys', async () => {
      const cars = [
        {
          'id': '9b20f96c-ce71-47f0-9f2d-c16da10b70b5',
          'seats': 1,
        },
        {
          'id': '69348604-6828-4a64-9913-94cfcb2cd953',
          'seats': 5,
        },
      ];
      await service.createCars({logger}, cars);
      expect(database.deleteJourney).toHaveBeenCalledTimes(1);
      expect(database.createCars).toHaveBeenCalledTimes(1);
    });
  });

  describe('locate group tests', () => {
    const groupIdLocate = '57550160-dbd0-11e9-a12c-ad42b04eeec7';
    const journeyWithoutCar = {
      'id': '57550160-dbd0-11e9-a12c-ad42b04eeec7',
      'people': 2,
    };
    it('should return the car where the group is located', async () => {
      database.findJourneyById.mockReturnValueOnce(journeyWithCar);
      database.findCarById.mockReturnValueOnce(car);
      const result = await service.locateGroup({logger}, groupIdLocate);
      expect(database.findJourneyById).toHaveBeenCalledTimes(1);
      expect(database.findCarById).toHaveBeenCalledTimes(1);
      expect(typeof result).toBe('object');
      expect(result).toMatchObject(car);
    });

    it('should return an empty object when the group have not car assigned', async () => {
      database.findJourneyById.mockReturnValueOnce(journeyWithoutCar);
      const result = await service.locateGroup({logger}, groupIdLocate);
      expect(database.findJourneyById).toHaveBeenCalledTimes(1);
      expect(database.findCarById).toHaveBeenCalledTimes(0);
      expect(typeof result).toBe('object');
      expect(result).toMatchObject({});
    });

  });

  describe('dropoff tests', () => {
    const groupIdDropOff = 1;
    const journeys = [{
      'id': '57550160-dbd0-11e9-a12c-ad42b04eeec7',
      'people': 2,
    },
    {
      'id': '67550160-dbd0-11e9-a12c-ad42b04eeec7',
      'people': 1,
    }];

    it('should drop off the journey when the group is located and should retry journeys without cars assigned', async () => {
      database.findJourneyById.mockReturnValueOnce(journeyWithCar);
      database.findCarById.mockReturnValueOnce(car);
      database.findJourneysWithoutCarAssigned.mockReturnValueOnce(journeys);
      database.getAvailableCarForPeople.mockReturnValueOnce(car);
      database.updateJourney.mockReturnValueOnce(journey);
      await service.dropOff({logger}, groupIdDropOff);
      expect(database.findJourneyById).toHaveBeenCalledTimes(1);
      expect(database.findCarById).toHaveBeenCalledTimes(1);
      expect(database.updateCarForJourney).toHaveBeenCalledTimes(1);
    });

    it('should drop off the journey when the group is located ' +
      'and should retry journeys without cars assigned but they cannot be retried because' +
      'there are not car available',
    async () => {
      database.findJourneyById.mockReturnValueOnce(journeyWithCar);
      database.findCarById.mockReturnValueOnce(car);
      database.findJourneysWithoutCarAssigned.mockReturnValueOnce(journeys);
      database.getAvailableCarForPeople.mockReturnValueOnce(undefined);
      database.updateJourney.mockReturnValueOnce(journey);
      await service.dropOff({logger}, groupIdDropOff);
      expect(database.findJourneyById).toHaveBeenCalledTimes(1);
      expect(database.findCarById).toHaveBeenCalledTimes(1);
      expect(database.updateCarForJourney).toHaveBeenCalledTimes(1);
      expect(database.updateJourney).toHaveBeenCalledTimes(0);
      expect(database.removeCarFromJourney).toHaveBeenCalledTimes(1);
    });

    it('should drop off the journey when the group is located ' +
      'and should not retry journeys without cars assigned because there are not any journey waiting for a car',
    async () => {
      database.findJourneyById.mockReturnValueOnce(journeyWithCar);
      database.findCarById.mockReturnValueOnce(car);
      database.findJourneysWithoutCarAssigned.mockReturnValueOnce([]);
      await service.dropOff({logger}, groupIdDropOff);
      expect(database.findJourneyById).toHaveBeenCalledTimes(1);
      expect(database.findCarById).toHaveBeenCalledTimes(1);
      expect(database.updateCarForJourney).toHaveBeenCalledTimes(1);
      expect(database.getAvailableCarForPeople).toHaveBeenCalledTimes(0);
      expect(database.updateJourney).toHaveBeenCalledTimes(0);
    });

    it('should throw an exception when the group is not found', async () => {
      database.findJourneyById.mockReturnValueOnce(undefined);
      expect(() => service
        .dropOff({logger}, groupIdDropOff).toThrow(new Error()));
      database.findJourneyById.resetMocks;
    });

  });

});
