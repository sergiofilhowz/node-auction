module.exports = function (sequelize, DataTypes) {

    /**
     * Player's Inventory model
     */
    var PlayerInventory = sequelize.define('PlayerInventory', {
        player_inventory_id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },

        quantity : DataTypes.INTEGER
    }, {
        timestamps : true,
        tableName : 'player_inventory',

        classMethods : {
            associate : function (models) {
                PlayerInventory.belongsTo(models.auction.Player, {
                    as : 'Owner',
                    foreignKey : 'player_id'
                });
                PlayerInventory.belongsTo(models.auction.Item, {
                    as : 'Item',
                    foreignKey : 'item_id'
                });
            }
        }
    });

    return PlayerInventory;

};