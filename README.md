# Car Pooling Service Challenge

Design/implement a system to manage car pooling.

At Cabify we provide the service of taking people from point A to point B.
So far we have done it without sharing cars with multiple groups of people.
This is an opportunity to optimize the use of resources by introducing car
pooling.

You have been assigned to build the car availability service that will be used
to track the available seats in cars.

Cars have a different amount of seats available, they can accommodate groups of
up to 4, 5 or 6 people.

People requests cars in groups of 1 to 6. People in the same group want to ride
on the same car. You can take any group at any car that has enough empty seats
for them. If it's not possible to accommodate them, they're willing to wait.

Once they get a car assigned, they will journey until the drop off, you cannot
ask them to take another car (i.e. you cannot swap them to another car to
make space for another group). In terms of fairness of trip order: groups are
served in the order they arrive, but they ride opportunistically.

For example: a group of 6 is waiting for a car and there are 4 empty seats at
a car for 6; if a group of 2 requests a car you may take them in the car for
6 but only if you have nowhere else to make them ride. This may mean that the
group of 6 waits a long time, possibly until they become frustrated and
leave.

## Evaluation rules

This challenge has a partially automated scoring system. This means that before
it is seen by the evaluators, it needs to pass a series of automated checks
and scoring.

### Checks

All checks need to pass in order for the challenge to be reviewed.

- The `acceptance` test step in the `.gitlab-ci.yml` must pass in master before you
submit your solution. We will not accept any solutions that do not pass or omit
this step. This is a public check that can be used to assert that other tests 
will run successfully on your solution. **This step needs to run without 
modification**
- _"further tests"_ will be used to prove that the solution works correctly. 
These are not visibile to you as a candidate and will be run once you submit 
the solution

### Scoring

There is a number of scoring systems being run on your solution after it is 
submitted. It is ok if these do not pass, but they add information for the
reviewers.

## API

To simplify the challenge and remove language restrictions, this service must
provide a REST API which will be used to interact with it.

This API must comply with the following contract:

### GET /status

Indicate the service has started up correctly and is ready to accept requests.

Responses:

* **200 OK** When the service is ready to receive requests.

### PUT /cars

Load the list of available cars in the service and remove all previous data
(existing journeys and cars). This method may be called more than once during 
the life cycle of the service.

**Body** _required_ The list of cars to load.

**Content Type** `application/json`

Sample:

```json
[
  {
    "id": 1,
    "seats": 4
  },
  {
    "id": 2,
    "seats": 6
  }
]
```

Responses:

* **200 OK** When the list is registered correctly.
* **400 Bad Request** When there is a failure in the request format, expected
  headers, or the payload can't be unmarshaled.

### POST /journey

A group of people requests to perform a journey.

**Body** _required_ The group of people that wants to perform the journey

**Content Type** `application/json`

Sample:

```json
{
  "id": 1,
  "people": 4
}
```

Responses:

* **200 OK** or **202 Accepted** When the group is registered correctly
* **400 Bad Request** When there is a failure in the request format or the
  payload can't be unmarshaled.

### POST /dropoff

A group of people requests to be dropped off. Whether they traveled or not.

**Body** _required_ A form with the group ID, such that `ID=X`

**Content Type** `application/x-www-form-urlencoded`

Responses:

* **200 OK** or **204 No Content** When the group is unregistered correctly.
* **404 Not Found** When the group is not to be found.
* **400 Bad Request** When there is a failure in the request format or the
  payload can't be unmarshaled.

### POST /locate

Given a group ID such that `ID=X`, return the car the group is traveling
with, or no car if they are still waiting to be served.

**Body** _required_ A url encoded form with the group ID such that `ID=X`

**Content Type** `application/x-www-form-urlencoded`

**Accept** `application/json`

Responses:

* **200 OK** With the car as the payload when the group is assigned to a car.
* **204 No Content** When the group is waiting to be assigned to a car.
* **404 Not Found** When the group is not to be found.
* **400 Bad Request** When there is a failure in the request format or the
  payload can't be unmarshaled.

## Tooling

At cabify, we use Gitlab and Gitlab CI for our backend development work. 
In this repo you may find a [.gitlab-ci.yml](./.gitlab-ci.yml) file which
contains some tooling that would simplify the setup and testing of the
deliverable. This testing can be enabled by simply uncommenting the final
acceptance stage.

Additionally, you will find a basic Dockerfile which you could use a
baseline, be sure to modify it as much as needed, but keep the exposed port
as is to simplify the testing.

You are free to modify the repository as much as necessary to include or remove
dependencies, but please document these decisions using MRs or in this very
README adding sections to it, the same way you would be generating
documentation for any other deliverable. We want to see how you operate in a
quasi real work environment.

:warning: Avoid dependencies and tools that would require changes to the 
`acceptance` step of [.gitlab-ci.yml](./.gitlab-ci.yml), such as 
`docker-compose`

## How To Istall

### Language & Libraries

First of all, make sure you have NodeJS installed by covering the official [installation guide](https://nodejs.org/en/download/) on your machine.

Once you have it, you can install and compile all dependencies by running on the project folder:

    npm run install

Additionally you can run the unit tests

    npm run test

### Database

Ensure you have `MongoDB` available on your machine. You can use either a [local installation](https://docs.mongodb.com/manual/installation/) or a [Docker distribution](https://hub.docker.com/_/mongo).

### Server

To start the application node server, run:

    npm start

Now you can create request to [`localhost:9091`](http://localhost:9091) curl / postman....

## Production

To prepare you application for production, you can use [`Dockerfile`](Dockerfile) for that. It will require you have [`Docker` installed locally](https://docs.docker.com/install/).

To build a `Docker` image, execute the following command:

    docker build . -t car_pooling:latest

Once built, you are able to push it to a remote repository as:

    docker push car_pooling:latest

It assumes you are authorized and logged in to a [`Docker` registry](https://docs.docker.com/registry/).

# Development Notes

On a different approach for a DropOff if for any reason when we do a drop off we delete the journey and release the seats on the car, I've implemented a
retry system that after releasing a car from its passengers it will retry all journeys that don't have a car assigned and checks if
after the release of the latest car some of them can be relocated on a car.

I reverted these changes (there are some comments on the code to enable again) because apparently of your tests
when a dropOff is made the journey shouldn't be deleted (from my point of view, this is not very clear on your documentation), so, my approach 
didn't pass all of your tests.