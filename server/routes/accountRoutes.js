const app = require('../config/server');
const authenticate = require('../middleware/authenticate');
const _ = require('lodash');
const _w = require('../config/winston')

const Account = require('../model/account');

app.post('/api/accounts', function (req, res) {
    var data = _.pick(req.body, ['email', 'password', 'name', 'surname']);
    var account = new Account(data);

    account.save()
        .then(() => {
            return account.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth', token).send(account);
        })
        .catch((e) => {
            _w.error(e);
            res.status(400).send(e);
        });
});

app.post('/api/accounts/login', function (req, res) {
    var data = _.pick(req.body, ['email', 'password']);
    var targetAccount;

    Account.findByCredentials(data.email, data.password)
        .then((account) => {
            targetAccount = account;
            return targetAccount.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(targetAccount);
        })
        .catch((e) => {
            _w.error(e);
            res.status(400).send(e);
        });
});

app.get('/api/accounts/me', authenticate, function (req, res) {
    res.send(req.account);
});

app.patch('/api/accounts/me/interests/add/:interestId', authenticate, function (req, res) {
    req.account.addInterest(req.params.interestId).then((account) => {
        res.send(account);
    }).catch((e) => {
        _w.error(e);
        res.status(400).send(e);
    });
});

app.patch('/api/accounts/me/interests/remove/:interestId', authenticate, function (req, res) {
    req.account.removeInterest(req.params.interestId).then((account) => {
        res.send(account);
    }).catch((e) => {
        _w.error(e);
        res.status(400).send(e);
    });
});

app.patch('/api/accounts/me/actions/:actionId/setstatus/', authenticate, function (req, res) {
    req.account.setActionStatus(req.params.actionId, req.body.statusCode).then((account) => {
        res.send(account);
    }).catch((e) => {
        _w.error(e);
        res.status(400).send(e);
    });
});

app.patch('/api/accounts/me/logout', authenticate, function (req, res) {
    req.account.removeToken().then((account) => {
        res.send(account);
    }).catch((e) => {
        _w.error(e);
        res.status(400).send(e);
    });
});

app.patch('/api/accounts/me/addbook', authenticate, function (req, res) {
    req.account.isBookNameValid(req.body.bookName).then((isValid) => {
        if (isValid) {
            req.account.addBook(req.body.bookName).then((account) => {
                res.send(account);
            }).catch((e) => {
                res.status(400).send(e);
            });
        } else {
            res.status(400).send(`There is already a book with name ${req.body.bookName}`);
        }
    })

});

app.patch('/api/accounts/me/addNote', authenticate, function (req, res) {
    req.account.addNote(req.body.bookId, req.body.content).then((account) => {
        res.send(account);
    }).catch((e) => {
        res.status(400).send(e);
    });
});