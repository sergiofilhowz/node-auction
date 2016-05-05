module.exports = function (sequelize, DataTypes) {

    /**
     * Player model
     */
    var Player = sequelize.define('Player', {
        player_id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },

        name : DataTypes.STRING,
        coins : DataTypes.INTEGER
    }, {
        timestamps : true,
        tableName : 'player',

        classMethods : {
            associate : function (models) {
                Player.hasMany(models.auction.PlayerInventory, {
                    as : 'Inventory',
                    foreignKey : 'player_id'
                });
                Player.hasMany(models.auction.Auction, {
                    as : 'AuctionsSold',
                    foreignKey : 'seller_id'
                });
                Player.hasMany(models.auction.Auction, {
                    as : 'AuctionsWon',
                    foreignKey : 'winner_id'
                });
            }
        }
    });

    return Player;

};