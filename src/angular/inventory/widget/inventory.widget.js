(function (angular) {
    'use strict';

    angular.module('auction.inventory').component('coaInventoryWidget', {
        transclude : true,
        templateUrl : 'inventory/widget/inventory.widget.html',
        bindings : {
            promise : '=',
            retry : '&'
        }
    });

}(angular));