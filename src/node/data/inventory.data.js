/**
 * This is a module to create the Data Queries to PlayerInventory
 *
 * Disclaimer: I am the author of SaphyreData
 *
 * @param models
 * @typedef {object} inventoryModel
 *
 */
module.exports = function inventoryModel(models, SaphyreData) {

    var PlayerInventory = models.auction.PlayerInventory,
        model = SaphyreData.createModel(PlayerInventory);

    model.projection('item', {
        'Item.$id' : 'id',
        'Item.name' : 'name',
        'Item.icon' : 'icon',
        'quantity' : 'quantity'
    });

    model.criteria('player', {
        name : 'id',
        property : 'Owner.$id',
        operator : SaphyreData.OPERATOR.EQUAL
    });

    model.sort('itemName', { 'Item.name' : 'ASC' });

    /**
     * Retrieves the player inventory
     *
     * @param playerId
     * @returns {Promise}
     */
    this.getPlayerInventory = function (playerId) {
        return model.list({
            projection : 'item',
            sort : 'itemName',
            criteria : {
                'player' : { id : playerId }
            }
        });
    };

    return this;

};