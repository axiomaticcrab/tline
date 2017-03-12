const winston = require('winston');
const config = require('../config/config');

if (config == 'development') {    
    //development evironment log config
} else {
    winston.handleExceptions(new winston.transports.File({
        filename: 'server/log/exceptions.log'
    }));
}

module.exports = winston;