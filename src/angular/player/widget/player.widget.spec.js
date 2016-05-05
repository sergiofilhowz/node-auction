describe('PlayerWidget', function () {
    'use strict';

    var $compile,
        $rootScope,
        $scope,
        element,
        template;

    beforeEach(module('auction.tpls', 'auction.player'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        template = '\
            <coa-player-widget player-name="player.name"\
                               player-coins="player.coins"\
                               logout="logout()"></coa-player-widget>';
    }));

    it('should bind player properties', function () {
        $scope = $rootScope.$new();
        $scope.player = {
            name : 'And then there was silence',
            coins : 12831
        };

        element = $compile(template)($scope);
        $scope.$digest();

        var rawElement = element[0];

        expect(rawElement.querySelector('.player-name span').innerHTML).toEqual('And then there was silence');
        expect(rawElement.querySelector('.player-coins span').innerHTML).toEqual('12831');

        $scope.player.name = 'Fear of the dark';
        $scope.player.coins = 43523;
        $scope.$digest();

        rawElement = element[0];
        expect(rawElement.querySelector('.player-name span').innerHTML).toEqual('Fear of the dark');
        expect(rawElement.querySelector('.player-coins span').innerHTML).toEqual('43523');
    });

    it('should evaluate logout expression', function () {
        $scope = $rootScope.$new();
        $scope.logout = jasmine.createSpy();

        element = $compile(template)($scope);
        $scope.$digest();

        element.find('button').triggerHandler('click');
        $scope.$digest();
        expect($scope.logout).toHaveBeenCalled();
    });

});