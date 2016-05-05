(function (angular) {
    'use strict';

    angular.module('auction.player')
        .service('playerSessionService', playerSessionService);

    playerSessionService.$inject = [];
    function playerSessionService() {
        this.token = null;
        return this;
    }

}(angular));