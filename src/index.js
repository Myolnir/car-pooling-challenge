const container = require('./boot');
const config = container.resolve('config');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const route_catalog = require('./routes/index');
const logger = require('./util/logger');


const server = restify.createServer({
  name: config.name,
  version: config.version,
});
/**
 * Middleware
 */
// Extend logger using the plugin.
server.use(restifyPlugins.requestLogger());
server.use(restifyPlugins.jsonBodyParser());
server.use(restifyPlugins.urlEncodedBodyParser());
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.fullResponse());
server.listen(config.port, () => {
  logger.debug('test logger');
  console.log('%s listening at %s', server.name, server.address().port);
  route_catalog(server);
});
