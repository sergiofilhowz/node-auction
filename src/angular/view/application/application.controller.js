(function (angular) {
    'use strict';

    angular.module('auction')
        .controller('ApplicationController', ApplicationController);

    ApplicationController.$inject = ['$interval', 'playerService', 'auctionService', 'playerSessionService', '$translate', '$mdToast'];
    function ApplicationController($interval, playerService, auctionService, playerSessionService, $translate, $mdToast) {
        var vm = this;

        vm.interval = $interval(decrementSeconds, 1000);

        vm.hasSession = hasSession;
        vm.login = login;
        vm.logout = logout;
        vm.createAuction = createAuction;
        vm.getPlayerInventory = getPlayerInventory;
        vm.getPlayerStats = getPlayerStats;
        vm.getActiveAuction = getActiveAuction;
        vm.placeBid = placeBid;
        vm.init = init;

        function login(name) {
            vm.loginPromise = playerService.login(name);
        }

        function hasSession() {
            return playerSessionService.token != null;
        }

        function decrementSeconds() {
            if (vm.auction && vm.auction.timeLeft > 0) {
                vm.auction.timeLeft--;
            }
        }

        function getPlayerInventory() {
            vm.inventoryPromise = playerService.getPlayerInventory()
                .then(assignTo(vm, 'inventory'));
        }

        function getPlayerStats() {
            vm.playerStatsPromise = playerService.getPlayerStats()
                .then(assignTo(vm, 'player'));
        }

        function createAuction(item) {
            auctionService.openDialogCreation(item, submitAuctionCreation);
        }

        function submitAuctionCreation(item, quantity, initialBid) {
            return auctionService.createAuction(item.id, quantity, initialBid);
        }

        function getActiveAuction() {
            vm.auctionPromise = auctionService.getActiveAuction().then(assignTo(vm, 'auction'));
        }

        function logout() {
            location.href = '';
        }

        const Events = {
            AUCTION_START : 'auction_start',
            AUCTION_FINISH : 'auction_finish',
            BID_PLACED : 'bid_placed',
            AUCTION_WIN : 'auction_win',
            INVENTORY_UPDATE : 'inventory_update',
            COIN_UPDATE : 'coin_update'
        };

        function init() {
            var socket = io.connect('/', {});
            socket.on('disconnect', logout);
            socket.on('connect', function () {
                socket.emit('authenticate', playerSessionService.token);
                socket.on(Events.AUCTION_START, assignTo(vm, 'auction'));
                socket.on(Events.AUCTION_FINISH, auctionFinish);
                socket.on(Events.BID_PLACED, assignTo(vm, 'auction'));
                socket.on(Events.AUCTION_WIN, auctionWin);
                socket.on(Events.INVENTORY_UPDATE, assignTo(vm, 'inventory'));
                socket.on(Events.COIN_UPDATE, coinUpdate);
            });
        }

        function auctionWin() {
            $translate('AUCTION_WON').then(function (message) {
                $mdToast.show($mdToast.simple().textContent(message));
            });
        }

        function placeBid(bidValue, auction) {
            return auctionService.placeBid(auction.id, bidValue);
        }

        function auctionFinish() {
            vm.auction = null;
        }

        function coinUpdate(coins) {
            vm.player.coins = coins;
        }

        function assignTo(object, property) {
            return function (result) {
                object[property] = result;
            };
        }
    }

}(angular));