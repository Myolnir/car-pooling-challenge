FROM node:10

ARG mongo_version=3.4.14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install -g mongodb-download

RUN mongodb-download --version=${mongo_version}

# Bundle app source
COPY package.json /usr/src/app/package.json
RUN npm install
COPY . . 

EXPOSE 9091
CMD [ "npm", "start" ]
