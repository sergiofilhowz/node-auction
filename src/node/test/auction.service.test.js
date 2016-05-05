var testHelper = require('./test.helper'),
    expect = testHelper.expect,
    sinon = testHelper.sinon,
    acqua = testHelper.acqua,
    dao = acqua.get('dao'),
    Promise = acqua.get('Promise'),
    AuctionError = acqua.get('AuctionError'),
    models = dao.models,
    Player = models.auction.Player,
    Item = models.auction.Item,
    Auction = models.auction.Auction,
    PlayerInventory = models.auction.PlayerInventory,
    players,
    items,
    auctionService,
    auctionModel = acqua.get('auctionModel'),
    inventoryModel = acqua.get('inventoryModel'),
    sequelize = acqua.get('sequelize'),
    notificationService;

describe('auctionService', () => {

    beforeEach(() => {
        return testHelper.sync().then(() => {
            notificationService = {
                broadcast : sinon.spy(),
                notificatePlayer : sinon.spy()
            };
            auctionService = require('../services/auction.service')(Promise, AuctionError, models, auctionModel,
                sequelize, notificationService, inventoryModel);

            return Item.bulkCreate([
                { name : 'Bread', icon : 'bread' },
                { name : 'Carrot', icon : 'carrot' },
                { name : 'Diamond' , icon : 'diamond' }
            ]).then(() => {
                return Player.bulkCreate([
                    { name : 'Blind Guardian', coins : 1000 },
                    { name : 'Iron Maiden', coins : 1000 }
                ]);
            }).then(() => {
                return Player.findAll();
            }).then(list => {
                players = list;
                return Item.findAll();
            }).then(list => items = list);
        });
    });

    describe('validation', () => {
        it('should not place auction without having the item', () => {
            var playerOne = players[0],
                itemOne = items[0];

            return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10).then(() => {
                throw new Error('an error should be thrown');
            }).catch(AuctionError, err => {
                expect(err).to.have.property('message').equal('AUCTION_ERROR_CREATE_AUCTION_NO_ITEM');
            });
        });

        it('should not create auction without enough items', () => {
            var playerOne = players[0],
                itemOne = items[0],
                quantity = 10;

            return PlayerInventory.create({
                player_id : playerOne.player_id,
                item_id : itemOne.item_id,
                quantity : quantity
            }).then(() => {
                return auctionService.createAuction(playerOne.player_id, itemOne.item_id, quantity + 1);
            }).then(() => {
                throw new Error('an error should be thrown');
            }).catch(AuctionError, err => {
                expect(err).to.have.property('message').equal('AUCTION_ERROR_CREATE_AUCTION_INSUFFICIENT_ITEM_QTT');
            });
        });
    });

    describe('creation', () => {
        var playerOne,
            itemOne,
            quantity = 10;

        beforeEach(() => {
            playerOne = players[0];
            itemOne = items[0];

            return PlayerInventory.create({
                player_id : playerOne.player_id,
                item_id : itemOne.item_id,
                quantity : quantity
            });
        });

        it('should create auction', () => {
            var auctionQuantity = quantity - 3,
                initialBid = 100;

            return auctionService.createAuction(playerOne.player_id, itemOne.item_id, auctionQuantity, initialBid)
                .then(auction => {
                    expect(auction).to.have.property('seller').to.have.property('id').equal(parseInt(playerOne.player_id));
                    expect(auction).to.have.property('seller').to.have.property('name').equal(playerOne.name);

                    expect(auction).to.have.property('item').to.have.property('id').equal(parseInt(itemOne.item_id));
                    expect(auction).to.have.property('item').to.have.property('icon').equal(itemOne.icon);
                    expect(auction).to.have.property('item').to.have.property('name').equal(itemOne.name);
                    expect(auction).to.have.property('item').to.have.property('quantity').equal(auctionQuantity);

                    expect(auction).to.have.property('initialBid').equal(initialBid);
                    expect(auction).to.have.property('winningBid').to.be.null;
                    expect(auction).to.have.property('timeLeft').equal(90); // should start with 90 seconds
                    expect(auction).to.have.property('originalTimeLeft').equal(90); // should start with 90 seconds
                });
        });

        it('shouldn`t create auction with another active', () => {
            var initialBid = 100;

            return auctionService.createAuction(playerOne.player_id, itemOne.item_id, quantity, initialBid).then(() => {
                return auctionService.createAuction(playerOne.player_id, itemOne.item_id, quantity, initialBid);
            }).then(() => {
                throw new Error('should throw an error');
            }).catch(AuctionError, err => {
                expect(err).to.have.property('message').equal('AUCTION_ERROR_CREATE_AUCTION_ANOTHER_ACTIVE');
            });
        });

        describe('bid placement', () => {
            describe('validation', () => {
                it('shouldn`t place bid on unexistant auction', () => {
                    var playerTwo = players[1];
                    return auctionService.placeBid(playerTwo.player_id, 12312, 100).then(() => {
                        throw new Error('should throw an error');
                    }).catch(AuctionError, err => {
                        expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_AUCTION_NOT_FOUND');
                    });
                });

                it('shouldn`t place bid with lesser value than initial bid', () => {
                    var playerTwo = players[1];
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => auctionService.placeBid(playerTwo.player_id, auction.id, 49))
                        .then(() => {
                            throw new Error('should throw an error');
                        }).catch(AuctionError, err => {
                            expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_LESSER_INITIAL_BID');
                        });
                });

                it('shouldn`t place bid on an auction with different id', () => {
                    var playerTwo = players[1];
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => auctionService.placeBid(playerTwo.player_id, 12312, 49))
                        .then(() => {
                            throw new Error('should throw an error');
                        }).catch(AuctionError, err => {
                            expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_AUCTION_NOT_FOUND');
                        });
                });

                it('shouldn`t place bid with lesser or equal value than winning bid', () => {
                    var playerTwo = players[1];
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => {
                            return auctionService.placeBid(playerTwo.player_id, auction.id, 80)
                                .then(() => auctionService.placeBid(playerTwo.player_id, auction.id, 80));
                        }).then(() => {
                            throw new Error('should throw an error');
                        }).catch(AuctionError, err => {
                            expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_LESSER_WINNING_BID');
                        });
                });

                it('should place first bid with value equal to initial bid', () => {
                    var playerTwo = players[1];
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => auctionService.placeBid(playerTwo.player_id, auction.id, 50));
                });

                it('should`t allow auction seller to place bid', () => {
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => auctionService.placeBid(playerOne.player_id, auction.id, 80))
                        .then(() => {
                            throw new Error('should throw an error');
                        }).catch(AuctionError, err => {
                            expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_OWN_AUCTION');
                        });
                });

                it('shouldn`t allow to place bid on a finished auction', () => {
                    var playerTwo = players[1];
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50)
                        .then(auction => {
                            return Auction.update({ finished : true }, {
                                where : { auction_id : auction.id }
                            }).then(() => auctionService.placeBid(playerTwo.player_id, auction.id, 80));
                        }).then(() => {
                            throw new Error('should throw an error');
                        }).catch(AuctionError, err => {
                            expect(err).to.have.property('message').equal('AUCTION_ERROR_PLACE_BID_AUCTION_NOT_FOUND');
                        });
                });
            });

            describe('creation', () => {
                it('should place a bid', () => {
                    var playerTwo = players[1],
                        auction;
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50).then(result => {
                        auction = result;
                        return auctionService.placeBid(playerTwo.player_id, auction.id, 80);
                    }).then(() => Auction.findById(auction.id))
                        .then(result => {
                            expect(result).to.have.property('winning_bid').equal(80);
                            expect(result).to.have.property('bidder_id').equal(playerTwo.player_id);
                        });
                });

                it('should update time_left if time_left is lesser than 10 when place a bid', () => {
                    var playerTwo = players[1],
                        auction;
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50).then(result => {
                        auction = result;
                        return Auction.update({ time_left : 7 }, {
                            where : { auction_id : auction.id }
                        }).then(() => auctionService.placeBid(playerTwo.player_id, auction.id, 80));
                    }).then(() => Auction.findById(auction.id))
                        .then(result => {
                            expect(result).to.have.property('winning_bid').equal(80);
                            expect(result).to.have.property('bidder_id').equal(playerTwo.player_id);
                            expect(result).to.have.property('time_left').equal(10);
                        });
                });

                it('should transfer coins when auction is finished', () => {
                    var playerTwo = players[1],
                        auction,
                        playerOneCoins = playerOne.coins,
                        playerTwoCoins = playerTwo.coins;
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50).then(result => {
                        auction = result;
                        return auctionService.placeBid(playerTwo.player_id, auction.id, 80);
                    }).then(() => auctionService.finishAuction(auction.id))
                        .then(() => playerOne.reload())
                        .then(() => playerTwo.reload())
                        .then(() => {
                            expect(playerOne).to.have.property('coins').equal(playerOneCoins + 80);
                            expect(playerTwo).to.have.property('coins').equal(playerTwoCoins - 80);
                        });
                });

                it('should finish auction with no bids', () => {
                    var auction,
                        playerOneCoins = playerOne.coins;
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 10, 50).then(result => {
                        auction = result;
                        return auctionService.finishAuction(auction.id);
                    }).then(() => playerOne.reload()).then(() => {
                        return Auction.findById(auction.id);
                    }).then(result => {
                        expect(result).to.have.property('finished').to.be.true;
                        expect(playerOne).to.have.property('coins').equal(playerOneCoins);
                        return auctionService.finishAuction(auction.id);
                    }).then(() => playerOne.reload()).then(() => {
                        expect(playerOne).to.have.property('coins').equal(playerOneCoins);
                    });
                });

                it('should transfer items when auction is finished', () => {
                    var playerTwo = players[1],
                        auction;
                    return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 5, 50).then(result => {
                        auction = result;
                        return auctionService.placeBid(playerTwo.player_id, auction.id, 80);
                    }).then(() => auctionService.finishAuction(auction.id)).then(() => {
                        return PlayerInventory.findOne({
                            where : {
                                player_id : playerTwo.player_id,
                                item_id : itemOne.item_id
                            }
                        })
                    }).then(winnerItemInventory => {
                        expect(winnerItemInventory).to.have.property('quantity').equal(5);

                        return PlayerInventory.findOne({
                            where : {
                                player_id : playerOne.player_id,
                                item_id : itemOne.item_id
                            }
                        });
                    }).then(sellerItemInventory => {
                        expect(sellerItemInventory).to.have.property('quantity').equal(5);

                        // going to sell the remaining 5, must remove the entry once the auction is finished
                        return auctionService.createAuction(playerOne.player_id, itemOne.item_id, 5, 50);
                    }).then(result => {
                        auction = result;
                        return auctionService.placeBid(playerTwo.player_id, auction.id, 80);
                    }).then(() => {
                        return auctionService.finishAuction(auction.id)
                    }).then(() => {
                        return PlayerInventory.findOne({
                            where : {
                                player_id : playerTwo.player_id,
                                item_id : itemOne.item_id
                            }
                        });
                    }).then(winnerItemInventory => {
                        expect(winnerItemInventory).to.have.property('quantity').equal(10);

                        return PlayerInventory.findOne({
                            where : {
                                player_id : playerOne.player_id,
                                item_id : itemOne.item_id
                            }
                        });
                    }).then(sellerItemInventory => {
                        expect(sellerItemInventory).to.not.exist;
                    });
                });
            });
        });

    });

});