const mongoose = require('mongoose');
const _w = require('./winston');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tLine');

mongoose.connection.on('connected', () => {
    _w.info('db connection established.');
});

mongoose.connection.on('error', (err) => {
    _w.warn('db connection error' + err);
});

mongoose.connection.on('disconnected', () => {
    _w.error('db connection is lost!');
});

module.exports = mongoose;