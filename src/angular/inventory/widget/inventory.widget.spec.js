describe('InventoryWidget', function () {
    'use strict';

    var $compile,
        $rootScope,
        $scope,
        element,
        template;

    beforeEach(module('auction.tpls', 'auction.inventory'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        template = '\
            <coa-inventory-widget>\
                <coa-inventory-item ng-repeat="item in items" \
                                    item-name="item.name"\
                                    item-quantity="item.quantity"\
                                    item-icon="item.icon"\
                                    item-click="itemClicked(item)"></coa-inventory-item>\
            </coa-inventory-widget>';
    }));

    function getInventoryItem(element, index) {
        return element.find('coa-inventory-item').eq(index);
    }

    function getItemName(itemElement) {
        return itemElement[0].querySelector('.inventory-item-name').innerHTML;
    }

    function getItemQuantity(itemElement) {
        return itemElement[0].querySelector('.inventory-item-quantity').innerHTML;
    }

    it('should bind inventory properties', function () {
        $scope = $rootScope.$new();
        $scope.items = [
            { name : 'Bread', icon : 'bread', quantity : 30 },
            { name : 'Carrot', icon : 'carrot', quantity : 18 },
            { name : 'Diamond', icon : 'diamond', quantity : 1 }
        ];

        element = $compile(template)($scope);
        $scope.$digest();

        var breadElement = getInventoryItem(element, 0);
        expect(getItemName(breadElement)).toEqual('Bread');
        expect(getItemQuantity(breadElement)).toEqual('30');

        var carrotElement = getInventoryItem(element, 1);
        expect(getItemName(carrotElement)).toEqual('Carrot');
        expect(getItemQuantity(carrotElement)).toEqual('18');

        var diamontElement = getInventoryItem(element, 2);
        expect(getItemName(diamontElement)).toEqual('Diamond');
        expect(getItemQuantity(diamontElement)).toEqual('1');
    });

    it('should evaluate click expression', function () {
        $scope = $rootScope.$new();
        $scope.items = [
            { name : 'Bread', icon : 'bread', quantity : 30 },
            { name : 'Carrot', icon : 'carrot', quantity : 18 },
            { name : 'Diamond', icon : 'diamond', quantity : 1 }
        ];

        $scope.itemClicked = jasmine.createSpy();
        element = $compile(template)($scope);
        $scope.$digest();

        var breadElement = getInventoryItem(element, 0);
        breadElement.find('button').triggerHandler('click');
        $scope.$digest();
        expect($scope.itemClicked).toHaveBeenCalledWith($scope.items[0]);

        var carrotElement = getInventoryItem(element, 1);
        carrotElement.find('button').triggerHandler('click');
        $scope.$digest();
        expect($scope.itemClicked).toHaveBeenCalledWith($scope.items[1]);

        var diamondElement = getInventoryItem(element, 2);
        diamondElement.find('button').triggerHandler('click');
        $scope.$digest();
        expect($scope.itemClicked).toHaveBeenCalledWith($scope.items[2]);
    });

});