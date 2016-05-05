(function (angular) {
    'use strict';

    angular.module('auction.player')
        .service('playerService', playerService);

    playerService.$inject = ['playerSessionService', '$http'];
    function playerService(playerSessionService, $http) {
        var self = this;
        
        self.login = login;
        self.getPlayerStats = getPlayerStats;
        self.getPlayerInventory = getPlayerInventory;

        function login(name) {
            return $http.post('/player/login', { name : name }).then(function (result) {
                playerSessionService.token = result.data.token;
            });
        }

        function getPlayerStats() {
            return $http.get('/player/stats').then(function (result) {
                return result.data;
            });
        }

        function getPlayerInventory() {
            return $http.get('/player/inventory').then(function (result) {
                return result.data;
            });
        }

        return self;
    }

}(angular));