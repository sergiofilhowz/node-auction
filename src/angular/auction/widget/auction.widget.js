(function (angular) {
    'use strict';

    angular.module('auction.auction').component('coaAuctionWidget', {
        templateUrl : 'auction/widget/auction.widget.html',
        bindings : {
            auction : '=',
            playerId : '=',
            placeBid : '&',
            promise : '=',
            retry : '&'
        },
        controller : auctionWidgetController
    });

    auctionWidgetController.$inject = ['$scope'];

    function auctionWidgetController($scope) {
        var $ctrl = this;

        $scope.$watchGroup(['$ctrl.auction.initialBid', '$ctrl.auction.winningBid'], function () {
            if (angular.isDefined($ctrl.auction)) {
                if (angular.isDefined($ctrl.auction.winningBid)) {
                    $ctrl.auction.minimumBid = $ctrl.auction.winningBid + 1;
                } else {
                    $ctrl.auction.winningBid = $ctrl.auction.initialBid;
                }
            }
        });

        $ctrl.confirm = confirm;

        function confirm(bidValue) {
            $ctrl.bidPromise = $ctrl.placeBid({
                bidValue : bidValue,
                auction : $ctrl.auction
            }).then(function () {
                $ctrl.bidValue = undefined;
            });
        }
    }

}(angular));