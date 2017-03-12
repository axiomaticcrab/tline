const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');

const {
    app
} = require('../server');

const {
    accounts,
    populateAccounts,
    tags,
    actions
} = require('./testHelper');

const Account = require('../model/account');

beforeEach(populateAccounts);

//==================>>>

describe('PATCH /accounts/me/addNote', () => {

    it('should add a new note to corresponding book', (done) => {
        var account = accounts[1];
        var bookId = account.books[0]._id;
        var content = 'haydar';
        request(app)
            .patch(`/api/accounts/me/addNote`)
            .set('x-auth', account.tokens[0].token)
            .send({
                bookId,
                content
            })
            .expect(200)
            .expect((res) => {})
            .end((err, res) => {
                Account.findById(account._id).then((account) => {
                        console.log(account);
                        expect(account.books.length).toBe(1);
                        expect(account.books[0].notes[0]).toExist();
                        expect(account.books[0].notes.length).toBe(1);                        
                        expect(account.books[0].notes[0].content).toBe(content);
                        done();
                    })
                    .catch((e) => done(e));
            });
    });

    it('should not add a new note to a book that is not exist', (done) => {
        var account = accounts[0];
        var bookId = 123;
        var content = 'haydar';
        request(app)
            .patch(`/api/accounts/me/addNote`)
            .set('x-auth', account.tokens[0].token)
            .send({
                bookId,
                content
            })
            .expect(400)
            .expect((res) => {})
            .end(done);
    });
});

describe('PATCH /accounts/me/addBook', () => {

    it('should add new book to account', (done) => {
        var account = accounts[0];
        var bookName = 'Test Book Name';
        request(app)
            .patch(`/api/accounts/me/addbook`)
            .set('x-auth', account.tokens[0].token)
            .send({
                bookName
            })
            .expect(200)
            .expect((res) => {})
            .end((err, res) => {
                Account.findById(account._id).then((account) => {
                        expect(account.books.length).toBe(1);
                        expect(account.books[0].name).toBe(bookName);
                        done();
                    })
                    .catch((e) => done(e));
            });
    });

    it('should not add a book with duplicate name', (done) => {
        var account = accounts[1];
        var bookName = account.books[0].name;
        request(app)
            .patch(`/api/accounts/me/addbook`)
            .set('x-auth', account.tokens[0].token)
            .send({
                bookName
            })
            .expect(400)
            .expect((res) => {})
            .end((err, res) => {
                Account.findById(account._id).then((targetAccount) => {
                        expect(targetAccount.books.length).toBe(1);
                        expect(targetAccount.books[0].name).toBe(bookName);
                        done();
                    })
                    .catch((e) => done(e));
            });
    });
});

describe('POST /accounts', () => {
    it('should create a new account', (done) => {
        var accountModel = {
            name: 'ali',
            surname: 'hekimoglu',
            email: 'axiomatic.crab@gmail.com',
            password: '123456'
        }

        request(app)
            .post('/api/accounts')
            .send(accountModel)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(accountModel.email);
                expect(res.body._id).toExist();
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Account.findById(res.body._id).then((account) => {
                    expect(account.name).toBe(_.upperFirst(accountModel.name));
                    expect(account.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    })
});

describe('POST /accounts/login', () => {
    it('should log in the account', (done) => {
        var data = _.pick(accounts[0], ['email', 'password']);
        request(app)
            .post('/api/accounts/login')
            .send(data)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(data.email);
                expect(res.body._id).toExist();
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Account.findById(res.body._id).then((account) => {
                    expect(account.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    })
});

describe('GET /accounts/me', () => {
    it('should return account with given token', (done) => {
        var data = accounts[0];
        request(app)
            .get('/api/accounts/me')
            .set('x-auth', data.tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(data.email);
                expect(res.body._id).toBe(data._id.toHexString());
            })
            .end(done);
    });
});

describe('PATCH /accounts/me/logout', () => {

    it('should remove token from given account', (done) => {
        var account = accounts[0];
        request(app)
            .patch(`/api/accounts/me/logout`)
            .set('x-auth', account.tokens[0].token)
            .expect(200)
            .expect((res) => {})
            .end((err, res) => {
                Account.findById(account._id).then((account) => {
                        expect(account.tokens.length).toBe(0);
                        done();
                    })
                    .catch((e) => done(e));
            });
    });
});