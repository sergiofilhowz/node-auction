module.exports = function (sequelize, DataTypes) {

    /**
     * Auction Model
     */
    var Auction = sequelize.define('Auction', {
        auction_id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },

        time_left : DataTypes.INTEGER,
        original_time_left : DataTypes.INTEGER,
        quantity : DataTypes.INTEGER,
        initial_bid : DataTypes.INTEGER,
        winning_bid : DataTypes.INTEGER,
        finished : DataTypes.BOOLEAN,

        last_time_left_update : DataTypes.DATE
    }, {
        timestamps : true,
        tableName : 'auction',

        classMethods : {
            associate : function (models) {
                Auction.belongsTo(models.auction.Player, {
                    as : 'Seller',
                    foreignKey : 'seller_id'
                });
                Auction.belongsTo(models.auction.Item, {
                    as : 'Item',
                    foreignKey : 'item_id'
                });

                Auction.belongsTo(models.auction.Player, {
                    as : 'Bidder',
                    foreignKey : 'bidder_id'
                });
                Auction.belongsTo(models.auction.Player, {
                    as : 'Winner',
                    foreignKey : 'winner_id'
                });
            }
        }
    });

    Auction.Status = {
        OPEN : 1,
        FINISHED : 2
    };

    return Auction;

};