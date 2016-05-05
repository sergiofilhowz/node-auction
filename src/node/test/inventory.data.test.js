var testHelper = require('./test.helper'),
    expect = testHelper.expect,
    acqua = testHelper.acqua,
    dao = acqua.get('dao'),
    Promise = acqua.get('Promise'),
    AuctionError = acqua.get('AuctionError'),
    models = dao.models,
    Player = models.auction.Player,
    PlayerInventory = models.auction.PlayerInventory,
    Item = models.auction.Item,
    inventoryModel = acqua.get('inventoryModel');

describe('inventoryModel', () => {

    beforeEach(() => testHelper.sync());

    it('should get inventory', () => {
        var player,
            bread,
            carrot,
            diamond;

        return Player.create({ name : 'Blind Guardian', coins : 1000 }).then(result => {
            player = result;
            return Item.create({ name : 'Bread', icon : 'bread' });
        }).then(_bread => {
            bread = _bread;
            return Item.create({ name : 'Carrot', icon : 'carrot' });
        }).then(_carrot => {
            carrot = _carrot;
            return Item.create({ name : 'Diamond', icon : 'diamond' });
        }).then(_diamond => {
            diamond = _diamond;

            return Promise.all([
                PlayerInventory.create({ player_id : player.player_id, item_id : bread.item_id, quantity : 10 }),
                PlayerInventory.create({ player_id : player.player_id, item_id : carrot.item_id, quantity : 15 }),
                PlayerInventory.create({ player_id : player.player_id, item_id : diamond.item_id, quantity : 20 })
            ]);
        }).then(() => {
            return inventoryModel.getPlayerInventory(player.player_id);
        }).then(list => {
            expect(list).with.length(3);

            expect(list[0]).to.have.property('id').equal(bread.item_id);
            expect(list[0]).to.have.property('name').equal(bread.name);
            expect(list[0]).to.have.property('icon').equal(bread.icon);
            expect(list[0]).to.have.property('quantity').equal(10);

            expect(list[1]).to.have.property('id').equal(carrot.item_id);
            expect(list[1]).to.have.property('name').equal(carrot.name);
            expect(list[1]).to.have.property('icon').equal(carrot.icon);
            expect(list[1]).to.have.property('quantity').equal(15);

            expect(list[2]).to.have.property('id').equal(diamond.item_id);
            expect(list[2]).to.have.property('name').equal(diamond.name);
            expect(list[2]).to.have.property('icon').equal(diamond.icon);
            expect(list[2]).to.have.property('quantity').equal(20);
        });
    });

});