/**
 * This is a module to create the Data Queries to Auction
 *
 * Disclaimer: I am the author of SaphyreData
 *
 * @param models
 * @typedef {object} auctionData
 *
 */
module.exports = function auctionModel(models, SaphyreData) {

    var Auction = models.auction.Auction,
        model = SaphyreData.createModel(Auction);

    model.projection('auction', {
        '$id' : 'id',
        'Seller.$id' : 'seller.id',
        'Seller.name' : 'seller.name',

        'Item.$id' : 'item.id',
        'Item.name' : 'item.name',
        'Item.icon' : 'item.icon',
        'quantity' : 'item.quantity',

        'initial_bid' : 'initialBid',
        'winning_bid' : 'winningBid',
        'time_left' : 'timeLeft',
        'original_time_left' : 'originalTimeLeft',
        'last_time_left_update' : 'timeLeftUpdate'
    }).use(auction => {
        var timeLeft = auction.timeLeft;
        auction.timeLeft = Math.max(timeLeft - Math.floor((new Date().getTime() - auction.timeLeftUpdate.getTime()) / 1000), 0);
        delete auction.last_time_left_update;
    });

    model.criteria('id', {
        name : 'id',
        property : '$id',
        operator : SaphyreData.OPERATOR.EQUAL
    });

    /**
     * Retrieves the auction data
     * @param auctionId
     * @returns {Promise}
     */
    this.getAuction = function (auctionId) {
        return model.single({
            projection : 'auction',
            criteria : {
                'id' : { id : auctionId }
            }
        });
    };

    return this;

};