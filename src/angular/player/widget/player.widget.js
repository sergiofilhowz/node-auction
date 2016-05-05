(function (angular) {
    'use strict';

    angular.module('auction.player').component('coaPlayerWidget', {
        templateUrl : 'player/widget/player.widget.html',
        bindings : {
            playerName : '=',
            playerCoins : '=',
            logout : '&',
            promise : '=',
            retry : '&'
        }
    });

}(angular));