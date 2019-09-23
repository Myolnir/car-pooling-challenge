/* Routes catalog home page. */
const catalog = require('./catalog');
module.exports = (server) => {

  catalog(server);
};