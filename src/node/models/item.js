module.exports = function (sequelize, DataTypes) {

    /**
     * Item model
     */
    var Item = sequelize.define('Item', {
        item_id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },

        name : DataTypes.STRING,
        icon : DataTypes.STRING
    }, {
        timestamps : true,
        tableName : 'item',

        classMethods : {
            associate : function (models) {
                Item.hasMany(models.auction.Auction, {
                    as : 'Auctions',
                    foreignKey : 'item_id'
                });
            }
        }
    });

    return Item;

};