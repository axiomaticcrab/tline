var jwt = require('jsonwebtoken');
var Account = require('../model/account');

var authenticate = function (req, res, next) {
    var token = req.header('x-auth');

    Account.findByToken(token).then((account) => {
        if (!account) {
            return Promise.reject();
        }

        req.account = account;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send('Authentication Failed!');
    });
}

module.exports = authenticate;