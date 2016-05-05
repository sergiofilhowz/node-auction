var Acqua = require('acqua'),
    path = require('path'),
    config = require('config'),
    express = require('express'),
    bodyParser = require('body-parser'),
    io = require('socket.io'),
    jwt = require('jsonwebtoken'),
    app = express(),
    server = require('http').createServer(app),
    acqua,
    AuctionError,
    Promise;

io = io.listen(server);

acqua = new Acqua({
    log : console.log,
    err : console.err
});

acqua.add('io', io);
acqua.add('app', app);
acqua.add('config', config);
acqua.loadDir(path.join(__dirname, 'api'));
acqua.loadDir(path.join(__dirname, 'data'));
acqua.loadDir(path.join(__dirname, 'services'));
dao = acqua.get('dao');
Promise = acqua.get('Promise');
AuctionError = acqua.get('AuctionError');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use((request, response, next) => {
    request.handle = function (promise) {
        if (!promise) {
            response.status(200).end();
        } else {
            promise.then(result => response.status(200).end(JSON.stringify(result)))
                .catch(AuctionError, err => response.status(500).end(JSON.stringify({ message : err.message })))
                .catch(err => {
                    console.error(err);
                    response.status(500).end(JSON.stringify({ message : 'AUCTION_UNKNOWN_ERROR' }));
                });
        }
    };

    request.getPlayerId = function () {
        var deferred = Promise.defer(),
            token = request.get('Token');
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err || !decoded.id) {
                response.status(401).end();
                deferred.reject();
            } else {
                deferred.resolve(decoded.id);
            }
        });
        return deferred.promise;
    };

    next();
});

acqua.loadDir(path.join(__dirname, 'routers'));

/**
 * Starts the application
 * @returns {Promise}
 */
exports.start = function () {
    var port = process.env.AUCTION_PORT || 8876;
    server.listen(port, () => console.log(`Server started at port ${port}`));
};

exports.acqua = acqua;