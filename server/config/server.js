const express = require('express');
const bodyParser = require('body-parser');
const _w = require('../config/winston');

var port = process.env.PORT;

var app = express();
app.use(bodyParser.json());


app.listen(port, () => {
    _w.info(`API started at port ${port}`);
});

module.exports = app;