const app = require('../server/config/server');
require('./config/config');

require('./routes/accountRoutes');

const _w = require('./config/winston')

module.exports = {app};