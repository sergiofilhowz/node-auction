process.env.NODE_ENV = 'test';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    app = require('../'),
    acqua,
    dao;

chai.use(sinonChai);

acqua = app.acqua;
dao = acqua.get('dao');

exports.chai = chai;
exports.expect = chai.expect;
exports.sinon = sinon;
exports.acqua = acqua;

exports.sync = function () {
    return dao.sync({ force : true });
};
exports.app = app;