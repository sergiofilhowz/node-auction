(function (angular) {
    'use strict';

    angular.module('auction.inventory').component('coaInventoryItem', {
        templateUrl : 'inventory/widget/item/inventory.item.html',
        bindings : {
            itemName : '=',
            itemQuantity : '=',
            itemIcon : '=',
            itemClick : '&'
        }
    });

}(angular));