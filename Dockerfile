FROM arcreactor/node-mongodb
COPY . /usr/src/app

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /app/

# supervisor installation &&
# create directory for child images to store configuration in
RUN apt-get update
RUN apt-get install -y supervisor && \
  mkdir -p /var/log/supervisor && \
  mkdir -p /etc/supervisor/conf.d

RUN npm ci --only=production

RUN mkdir -p /var/log/supervisor && \
 mkdir -p /data/db


# supervisor base configuration
ADD supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Bundle app source
COPY . .

EXPOSE 9091
#CMD service /usr/bin/mongod && npm start
# default command
CMD ["/usr/bin/supervisord", "-n", "--configuration", "/etc/supervisor/conf.d/supervisord.conf"]
