(function (angular) {
    'use strict';

    angular.module('auction.auction')
        .service('auctionService', auctionService);

    auctionService.$inject = ['$http', '$mdDialog'];

    function auctionService($http, $mdDialog) {
        var self = this;

        self.getActiveAuction = getActiveAuction;
        self.createAuction = createAuction;
        self.placeBid = placeBid;
        self.openDialogCreation = openDialogCreation;

        function getActiveAuction() {
            return $http.get('/auction').then(function (result) {
                return result.data == 'null' ? null : result.data;
            });
        }

        function createAuction(itemId, quantity, initialBid) {
            return $http.post('/auction', {
                itemId : itemId,
                quantity : quantity,
                initialBid : initialBid
            }).then(function (result) {
                return result.data;
            });
        }

        function placeBid(auctionId, value) {
            return $http.post('/auction/bid', {
                auctionId : auctionId,
                value : value
            }).then(function (result) {
                return result.data;
            });
        }

        function openDialogCreation(item, confirmFn) {
            $mdDialog.show({
                parent : angular.element(document.querySelector('body')),
                templateUrl : 'auction/service/auction.form.html',
                locals : { item : item, confirmFn : confirmFn },
                controller : auctionFormController
            });
        }

        return self;
    }

    auctionFormController.$inject = ['$scope', '$mdDialog', 'item', 'confirmFn'];

    function auctionFormController($scope, $mdDialog, item, confirmFn) {
        $scope.item = item;
        $scope.closeDialog = closeDialog;
        $scope.confirm = confirm;

        function closeDialog() {
            $mdDialog.hide();
        }

        function confirm() {
            $scope.promise = confirmFn(item, $scope.quantity, $scope.initialBid).then(function (result) {
                closeDialog();
                return result;
            }).catch(function () {
                closeDialog();
            });
        }
    }

}(angular));