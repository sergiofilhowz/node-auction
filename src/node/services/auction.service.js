var _ = require('lodash');

/**
 * This is the Service that handles the auction house
 * @typedef {Object} auctionService
 */
module.exports = function auctionService(Promise, AuctionError, models, auctionModel, sequelize,
                                         notificationService, inventoryModel) {

    var PlayerInventory = models.auction.PlayerInventory,
        Auction = models.auction.Auction,
        Player = models.auction.Player,
        timeout;

    /**
     * This is the possible events
     */
    const Events = {
        /**
         * Event emmited when an auction is started, everyone connected will receive this notification
         */
        AUCTION_START : 'auction_start',

        /**
         * Event emmited when an auction is finished, everyone connected will receive this notification
         */
        AUCTION_FINISH : 'auction_finish',

        /**
         * Event emmited when a new bid is placed on the active auction
         */
        BID_PLACED : 'bid_placed',

        /**
         * Event emmited when an auction is finished, and the player is the winner
         */
        AUCTION_WIN : 'auction_win',

        /**
         * Event emmited when the player's inventory is modified
         */
        INVENTORY_UPDATE : 'inventory_update',

        /**
         * Event emmited when the player's coins are modified
         */
        COIN_UPDATE : 'coin_update'
    };

    const INITIAL_TIME_LEFT = 90,
        BID_TIME_LEFT = 10; // this is the minimum time left whenever a bid is placed

    this.getActiveAuction = getActiveAuction;
    this.createAuction = createAuction;
    this.placeBid = placeBid;
    this.finishAuction = finishAuction;

    function closeActiveAuction() {
        /* XXX it will have problem with horizontal scaling */
        return Auction.findOne({ attributes : ['auction_id'], where : { finished : false }}).then(auction => {
            if (auction) {
                auction.finished = true;
                auction.bidder_id = null;
                auction.winning_bid = null;
                return auction.save();
            }
        }).catch(err => {
            console.error(err);
            throw err;
        });
    }

    closeActiveAuction();

    /**
     *  Create a new auction.
     *
     * @param {number} playerId     The player that is creating the auction
     * @param {number} itemId       The item that is being auctioned
     * @param {number} quantity     The amount of items to be auctioned
     * @param {number} initialBid   The starting bid
     */
    function createAuction(playerId, itemId, quantity, initialBid) {
        return PlayerInventory.findOne({ where : { item_id : itemId, player_id : playerId } }).then(itemInventory => {
            if (itemInventory == null) {
                throw new AuctionError('AUCTION_ERROR_CREATE_AUCTION_NO_ITEM');
            }
            if (itemInventory.quantity < quantity) {
                throw new AuctionError('AUCTION_ERROR_CREATE_AUCTION_INSUFFICIENT_ITEM_QTT');
            }

            return getActiveAuction();
        }).then(auction => {
            if (auction) {
                throw new AuctionError('AUCTION_ERROR_CREATE_AUCTION_ANOTHER_ACTIVE');
            }

            return Auction.create({
                time_left : INITIAL_TIME_LEFT,
                original_time_left : INITIAL_TIME_LEFT,
                quantity : quantity,
                initial_bid : initialBid,
                finished : false,
                seller_id : playerId,
                item_id : itemId,
                last_time_left_update : new Date()
            });
        }).then(auction => {
            return auctionModel.getAuction(auction.auction_id);
        }).then(auction => {
            notificationService.broadcast(Events.AUCTION_START, auction);
            timeout = setTimeout(() => finishAuction(auction.id), auction.timeLeft * 1000);
            return auction;
        });
    }

    /**
     * Place a new bid on an active auction.
     *
     * @param {number} playerId     The player that is placing the bid
     * @param {number} auctionId    The auction id to place the bid
     * @param {number} value        The bid value
     */
    function placeBid(playerId, auctionId, value) {
        var timeLeftChanged = false;
        return Auction.findOne({ where : { finished : false }}).then(auction => {
            if (!auction || auction.auction_id != auctionId) {
                throw new AuctionError('AUCTION_ERROR_PLACE_BID_AUCTION_NOT_FOUND');
            }
            if (playerId == auction.seller_id) {
                throw new AuctionError('AUCTION_ERROR_PLACE_BID_OWN_AUCTION');
            }
            if (auction.winning_bid === null && value < auction.initial_bid) {
                throw new AuctionError('AUCTION_ERROR_PLACE_BID_LESSER_INITIAL_BID');
            }
            if (auction.winning_bid !== null && value <= auction.winning_bid) {
                throw new AuctionError('AUCTION_ERROR_PLACE_BID_LESSER_WINNING_BID');
            }

            auction.bidder_id = playerId;
            auction.winning_bid = value;

            var timeLeft = Math.max(auction.time_left -
                Math.floor((new Date().getTime() - auction.last_time_left_update.getTime()) / 1000), 0);

            if (timeLeft < BID_TIME_LEFT) {
                auction.time_left = BID_TIME_LEFT;
                auction.last_time_left_update = new Date();

                timeLeftChanged = true;
            }

            return auction.save();
        }).then(auction => {
            return auctionModel.getAuction(auction.auction_id);
        }).then(auction => {
            if (timeLeftChanged) {
                clearTimeout(timeout);
                timeout = setTimeout(() => finishAuction(auction.id), auction.timeLeft * 1000);
            }
            notificationService.broadcast(Events.BID_PLACED, auction);
        });
    }

    function getActiveAuction() {
        return Auction.findOne({
            attributes : ['auction_id'],
            where : { finished : false }
        }).then(auction => {
            if (auction) {
                return auctionModel.getAuction(auction.auction_id);
            }
        });
    }

    function finishAuction(auctionId) {
        return Auction.findById(auctionId).then(auction => {
            if (auction.finished) {
                return;
            }

            if (auction.bidder_id == null) {
                // no bidder on this auction
                auction.finished = true;
                return auction.save().then(() => {
                    notificationService.broadcast(Events.AUCTION_FINISH);
                });
            }

            return sequelize.transaction().then(transaction => {
                var winner,
                    seller;

                return PlayerInventory.findOne({
                    where : { player_id : auction.bidder_id, item_id : auction.item_id }
                }).then(itemInventory => {
                    // give the items to the auction winner
                    if (!itemInventory) {
                        return PlayerInventory.create({
                            player_id : auction.bidder_id,
                            item_id : auction.item_id,
                            quantity : auction.quantity
                        }, { transaction : transaction });
                    } else {
                        itemInventory.quantity += auction.quantity;
                        return itemInventory.save({ transaction : transaction });
                    }
                }).then(() => {
                    return PlayerInventory.findOne({
                        where : { player_id : auction.seller_id , item_id : auction.item_id }
                    });
                }).then(itemInventory => {
                    // take of the item from the seller
                    if (auction.quantity == itemInventory.quantity) {
                        return itemInventory.destroy({ transaction : transaction });
                    }
                    itemInventory.quantity -= auction.quantity;
                    return itemInventory.save({ transaction : transaction });
                }).then(() => {
                    return Player.findById(auction.bidder_id);
                }).then(result => {
                    winner = result;
                    // take of the coins from auction winner
                    winner.coins -= auction.winning_bid;
                    return winner.save({ transaction : transaction });
                }).then(() => {
                    return Player.findById(auction.seller_id);
                }).then(result => {
                    seller = result;
                    // give the coins to auction seller
                    seller.coins += auction.winning_bid;
                    return seller.save({ transaction : transaction });
                }).then(() => {
                    auction.winner_id = auction.bidder_id;
                    auction.finished = true;
                    return auction.save({ transaction : transaction });
                }).then(() => {
                    return transaction.commit();
                }).then(() => {
                    notificationService.notificatePlayer(winner.player_id, Events.COIN_UPDATE, winner.coins);
                    notificationService.notificatePlayer(winner.player_id, Events.AUCTION_WIN);

                    notificationService.notificatePlayer(seller.player_id, Events.COIN_UPDATE, seller.coins);
                    notificationService.notificatePlayer(seller.player_id, Events.INVENTORY_UPDATE, seller.coins);

                    notificationService.broadcast(Events.AUCTION_FINISH);

                    return inventoryModel.getPlayerInventory(winner.player_id).then(winnerInventory => {
                        notificationService.notificatePlayer(winner.player_id, Events.INVENTORY_UPDATE, winnerInventory);
                        return inventoryModel.getPlayerInventory(seller.player_id);
                    }).then(sellerInventory => {
                        notificationService.notificatePlayer(seller.player_id, Events.INVENTORY_UPDATE, sellerInventory);
                    }).catch(err => {
                        // this should not affect transaction
                        console.error(err);
                    });
                });
            });

        });
    }

    return this;

};