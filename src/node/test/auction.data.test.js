var testHelper = require('./test.helper'),
    expect = testHelper.expect,
    acqua = testHelper.acqua,
    dao = acqua.get('dao'),
    Promise = acqua.get('Promise'),
    AuctionError = acqua.get('AuctionError'),
    models = dao.models,
    Player = models.auction.Player,
    Auction = models.auction.Auction,
    Item = models.auction.Item,
    auctionModel = acqua.get('auctionModel');

describe('auctionModel', () => {

    beforeEach(() => testHelper.sync());

    it('should get auction', () => {
        var item,
            player,
            auction;
        return Item.create({ name : 'Bread', icon : 'bread' }).then(result => {
            item = result;
            return Player.create({ name : 'Blind Guardian', coins : 1000 });
        }).then(result => {
            player = result;
            return Auction.create({
                time_left : 90,
                original_time_left : 167,
                quantity : 10,
                initial_bid : 151,
                winning_bid : 199,
                finished : false,
                seller_id : player.player_id,
                item_id : item.item_id,
                last_time_left_update : new Date()
            });
        }).then(result => {
            auction = result;

            return auctionModel.getAuction(auction.auction_id);
        }).then(result => {
            expect(result).to.have.property('seller').to.have.property('id').equal(player.player_id);
            expect(result).to.have.property('seller').to.have.property('name').equal(player.name);

            expect(result).to.have.property('item').to.have.property('id').equal(item.item_id);
            expect(result).to.have.property('item').to.have.property('icon').equal(item.icon);
            expect(result).to.have.property('item').to.have.property('name').equal(item.name);
            expect(result).to.have.property('item').to.have.property('quantity').equal(10);

            expect(result).to.have.property('initialBid').equal(151);
            expect(result).to.have.property('winningBid').equal(199);
            expect(result).to.have.property('timeLeft').equal(90);
            expect(result).to.have.property('originalTimeLeft').equal(167);
        });
    });

});