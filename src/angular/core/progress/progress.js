(function (angular) {
    'use strict';

    angular.module('auction.core').component('coaProgress', {
        templateUrl : 'core/progress/progress.html',
        bindings : {
            promise : '=',
            retry : '&'
        }
    });

}(angular));