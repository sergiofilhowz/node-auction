var jwt = require('jsonwebtoken');

module.exports = function notificationService(io, config) {

    var self = this;

    self.connections = {};

    self.broadcast = broadcast;
    self.notificatePlayer = notificatePlayer;

    io.on('connection', socket => {
        var playerId;
        socket.on('authenticate', token => {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err || !decoded.id) {
                    socket.disconnect();
                } else {
                    var oldSocket = self.connections[decoded.id];
                    playerId = decoded.id;
                    if (oldSocket) {
                        oldSocket.on('disconnect', () => {
                            self.connections[playerId] = socket;
                        });
                        oldSocket.disconnect('another login');
                    } else {
                        self.connections[playerId] = socket;
                    }
                    socket.join('authenticated');
                }
            });
        });

        socket.on('disconnect', () => {
            delete self.connections[playerId];
        });
    });

    function broadcast(event, data) {
        io.to('authenticated').emit(event, data);
    }

    function notificatePlayer(playerId, event, data) {
        var socket = self.connections[playerId];
        if (socket) {
            socket.emit(event, data);
        }
    }

    return self;
};