module.exports = function (sequelize, DataTypes) {

    /**
     * This Model is important to determine the configuration of a starting inventory,
     * so that the business logic of building a new player inventory doesn't have to be in the code and
     * can be changed anytime by a configuration interface.
     */
    var StartingInventory = sequelize.define('StartingInventory', {
        item_id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },

        quantity : DataTypes.INTEGER
    }, {
        timestamps : false,
        tableName : 'starting_inventory'
    });

    return StartingInventory;

};