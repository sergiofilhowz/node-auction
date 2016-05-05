(function (angular) {
    'use strict';

    angular.module('auction', [
        'pascalprecht.translate',
        'ngMaterial',
        'ngMdIcons',

        'auction.core',
        'auction.tpls',
        'auction.player',
        'auction.inventory',
        'auction.auction'
    ]);

}(angular));