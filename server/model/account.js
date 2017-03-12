const mongoose = require('../config/mongoose');
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const moment = require('moment');

var Schema = mongoose.Schema;

var accountSchema = new Schema({
    email: {
        type: String,
        required: '{PATH} is required',
        unique: true,
        trim: true,
        minlenght: 1,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: 'The given {VALUE} is not a valid email adress.'
        }
    },
    password: {
        type: String,
        require: '{PATH} is required.',
        minlenght: 6,
    },
    tokens: [{
        access: {
            type: String,
            require: '{PATH} is required.'
        },
        token: {
            type: String,
            require: '{PATH} is required.'
        },
    }],
    name: {
        type: String,
        required: "{PATH} is required",
        minlength: 1,
        trim: true
    },
    surname: {
        type: String,
        required: '{PATH} is required',
        minlength: 1,
        trim: true
    },
    books: [{
        name: {
            type: String,
            required: '{PATH} is required'
        },
        notes: [{
            content: {
                type: String,
                required: '{PATH} is required'
            },
            date: {
                type: String,
                required: '{PATH} is required',
                validate: {
                    validator: function (date) {
                        return moment(date).isValid();
                    },
                    messsage: 'The given date {VALUE} is not valid! Please send a date string with following format MM/YYYY'
                }
            },
        }]
    }]
});

accountSchema.virtual('displayName').get(function () {
    var account = this;
    return `${account.name} ${account.surname}`;
});

accountSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';

    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET);

    user.tokens = [];
    user.tokens.push({
        access,
        token,
    });

    return user.save().then(() => token);
}

accountSchema.methods.removeToken = function () {
    var account = this;
    account.tokens = [];
    return account.save();
}

accountSchema.methods.toJSON = function () {
    var account = this;
    var accountObject = account.toObject({
        virtuals: true
    });
    return _.pick(accountObject, ['_id', 'email', 'displayName', 'interests', 'actions','books']);
}

accountSchema.methods.addBook = function (bookName) {
    var account = this;
    account.books.push({
        name: bookName,
        notes: []
    });
    return account.save();
}

accountSchema.methods.removeBook = function (bookId) {

}

accountSchema.methods.addNote = function (bookId, noteContent) {
    return new Promise((resolve, reject) => {
        var account = this;
        var bookIndex = _.findIndex(account.books, function (b) {
            return b._id.toHexString() === bookId.toString();
        });

        if (bookIndex === -1) {
            reject('there is no book.')
        } else {
            account.books[bookIndex].notes.push({
                content: noteContent,
                date: moment().format()
            });
            resolve(account.save());
        }
    })
}

accountSchema.methods.removeNote = function (bookId, noteId) {

}

accountSchema.methods.isBookNameValid = function (name) {
    var account = this;
    return new Promise((resolve, reject) => {
        if (account.books && account.books.lenght !== 0) {
            var bookIndex = _.findIndex(account.books, ['name', name]);
            if (bookIndex === -1) {
                resolve(true);
                // return true;
            } else {
                resolve(false);
                // return false;
            }
        } else {
            resolve(true)
            // return true;
        }
    });
}

accountSchema.statics.findByToken = function (token) {
    var Account = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return Account.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

accountSchema.statics.findByCredentials = function (email, password) {
    return new Promise((resolve, reject) => {
        Account.findOne({
            'email': email
        }).then((account) => {
            if (!account) {
                reject(`No account with given email ${email}`);
            }

            bcrypt.compare(password, account.password, (err, res) => {
                if (res) {
                    resolve(account);
                } else {
                    reject(`Wrong email password combination.`);
                }
            })
        });
    });
}

accountSchema.pre('save', function (next) {
    var account = this;
    account.name = _.upperFirst(account.name);
    account.surname = _.upperFirst(account.surname);

    if (account.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(account.password, salt, (err, hash) => {
                account.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var Account = mongoose.model('account', accountSchema);

module.exports = Account;