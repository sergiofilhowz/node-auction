var testHelper = require('./test.helper'),
    expect = testHelper.expect,
    acqua = testHelper.acqua,
    dao = acqua.get('dao'),
    Promise = acqua.get('Promise'),
    AuctionError = acqua.get('AuctionError'),
    models = dao.models,
    Item = models.auction.Item,
    Player = models.auction.Player,
    StartingInventory = models.auction.StartingInventory,
    playerService = require('../services/player.service')(Promise, models),
    inventoryModel = acqua.get('inventoryModel');

describe('playerService', () => {

    beforeEach(() => {
        return testHelper.sync().then(() => {
            return Item.bulkCreate([
                { name : 'Bread', icon : 'bread' },
                { name : 'Carrot', icon : 'carrot' },
                { name : 'Diamond' , icon : 'diamond' }
            ]).then(() => {
                return StartingInventory.bulkCreate([
                    { item_id : 1, quantity : 10 },
                    { item_id : 2, quantity : 5 }
                ]);
            });

        })
    });

    it('should create a user when there`s none with given username', () => {
        return Player.findOne({ where : { name : 'Blind Guardian' } }).then(player => {
            expect(player).to.not.exist;
            return playerService.loginOrCreate('Blind Guardian');
        }).then(() => {
            return Player.findOne({ where : { name : 'Blind Guardian' } });
        }).then(player => {
            expect(player).to.exist;

            expect(player).to.have.property('coins').equal(1000);

            return inventoryModel.getPlayerInventory(player.player_id);
        }).then(list => {
            expect(list).with.length(2);

            expect(list[0]).to.have.property('id').equal(1);
            expect(list[0]).to.have.property('name').equal('Bread');
            expect(list[0]).to.have.property('icon').equal('bread');
            expect(list[0]).to.have.property('quantity').equal(10);

            expect(list[1]).to.have.property('id').equal(2);
            expect(list[1]).to.have.property('name').equal('Carrot');
            expect(list[1]).to.have.property('icon').equal('carrot');
            expect(list[1]).to.have.property('quantity').equal(5);

            return playerService.loginOrCreate('Blind Guardian');
        }).then(player => {
            expect(player).to.exist;
            expect(player).to.have.property('coins').equal(1000);
        });
    });

    it('should get player stats', () => {
        var playerId;
        return Player.create({ name : 'Blind Guardian', coins : 12314 }).then(player => {
            playerId = player.player_id;
            return playerService.getPlayerStats(playerId);
        }).then(player => {
            expect(player).to.exist;
            expect(player).to.have.property('coins').equal(12314);
            expect(player).to.have.property('name').equal('Blind Guardian');
            expect(player).to.have.property('id').equal(playerId.toString());
        });
    });

});