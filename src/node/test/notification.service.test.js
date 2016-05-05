var testHelper = require('./test.helper'),
    expect = testHelper.expect,
    sinon = testHelper.sinon,
    notificationService,
    roomMock,
    ioMock;

describe('notificationService', () => {

    beforeEach(() => {
        roomMock = { emit : sinon.spy() };
        ioMock = {
            emit : sinon.spy(),
            to : sinon.stub().returns(roomMock),
            on : sinon.spy()
        };
        notificationService = require('../services/notification.service')(ioMock);
    });

    it('should broadcast', () => {
        var data = { name : 'And then there was silence' },
            eventName = 'play_this_song';

        notificationService.broadcast(eventName, data);
        expect(ioMock.to).to.have.been.calledWith('authenticated');
        expect(roomMock.emit).to.have.been.calledWith(eventName, data);
    });

    it('should notificate player', () => {
        var data = { name : 'And then there was silence' },
            playerId = 1,
            eventName = 'play_this_song',
            socket = { emit : sinon.spy() };

        notificationService.connections[playerId] = socket;

        notificationService.notificatePlayer(playerId, eventName, data);
        expect(ioMock.emit).to.not.have.been.called;
        expect(socket.emit).to.have.been.calledWith(eventName, data);
    });

});