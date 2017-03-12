const {
    ObjectID
} = require('mongodb');
const jwt = require('jsonwebtoken');

const Account = require('../model/account');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const bookOneId = new ObjectID();



const accounts = [{
    _id: userOneId,
    email: 'example1@gmail.com',
    password: 'userOnePass',
    name: 'cool',
    surname: 'name',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userOneId,
            access: 'auth'
        }, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    email: 'example2@gmail.com',
    password: 'userTwoPass',
    name: 'cool',
    surname: 'name',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userTwoId,
            access: 'auth'
        }, process.env.JWT_SECRET).toString()
    }],
    books: [{
        _id : bookOneId,
        name: 'Test Book Name',
        notes: []
    }]
}];

const populateAccounts = (done) => {
    Account.remove({}).then(() => {
        var accountOne = new Account(accounts[0]).save();
        var accountTwo = new Account(accounts[1]).save();

        return Promise.all([accountOne, accountTwo])
    }).then(() => done());
};

module.exports = {
    accounts,
    populateAccounts,
};