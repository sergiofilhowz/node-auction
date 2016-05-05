describe('playerService', function () {
    'use strict';

    var $rootScope,
        playerService,
        playerSessionService,
        $httpBackend;

    beforeEach(module('auction.player'));

    beforeEach(inject(function (_$rootScope_, _playerService_, _playerSessionService_, _$httpBackend_) {
        playerService = _playerService_;
        playerSessionService = _playerSessionService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    it('should get player stats', function () {
        var success = jasmine.createSpy(),
            playerStats = {
                id : 1,
                name : 'Blind Guardian',
                coins : 54623
            };

        $httpBackend.when('GET', '/player/stats').respond(playerStats);

        playerService.getPlayerStats().then(success);
        $httpBackend.flush();

        expect(success).toHaveBeenCalledWith(playerStats);
    });

    it('should get inventory', function () {
        var success = jasmine.createSpy(),
            playerInventory = [
                { id : 1, name : 'Bread', icon : 'bread' },
                { id : 2, name : 'Carrot', icon : 'carrot' },
                { id : 3, name : 'Diamond', icon : 'diamond' }
            ];

        $httpBackend.when('GET', '/player/inventory').respond(playerInventory);

        playerService.getPlayerInventory().then(success);
        $httpBackend.flush();

        expect(success).toHaveBeenCalledWith(playerInventory);
    });

    it('should login', function () {
        var success = jasmine.createSpy(),
            name = 'Blind Guardian',
            response = { token : '23u8912u390123u1902' };

        $httpBackend.when('POST', '/player/login', { name : name }).respond(response);

        playerService.login(name).then(success);
        $httpBackend.flush();

        expect(success).toHaveBeenCalled();
        expect(playerSessionService.token).toEqual('23u8912u390123u1902');
    });

});