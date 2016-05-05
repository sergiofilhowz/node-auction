var express = require('express');

module.exports = function auctionRouter(app, auctionService) {
    var router = express.Router();

    router.get('/', getCurrentAuction);
    router.post('/', createAuction);
    router.post('/bid', placeBid);

    function getCurrentAuction(request) {
        request.getPlayerId().then(() => {
            request.handle(auctionService.getActiveAuction());
        });
    }

    function createAuction(request) {
        var auction = request.body;
        request.getPlayerId().then(playerId => {
            request.handle(auctionService.createAuction(playerId, auction.itemId, auction.quantity, auction.initialBid));
        });
    }

    function placeBid(request) {
        var bid = request.body;
        request.getPlayerId().then(playerId => {
            request.handle(auctionService.placeBid(playerId, bid.auctionId, bid.value));
        });
    }

    app.use('/auction', router);

    this.router = router;

    return this;
};