var _ = require('lodash');

module.exports = function playerService(Promise, models) {

    var Player = models.auction.Player,
        PlayerInventory = models.auction.PlayerInventory,
        StartingInventory = models.auction.StartingInventory;

    const PLAYER_STARTING_COINS = 1000;

    this.loginOrCreate = loginOrCreate;
    this.getPlayerStats = getPlayerStats;

    /**
     * Performs the login, if the name doesn't already exist, create a new User
     * @param name
     * @returns {*}
     */
    function loginOrCreate(name) {
        return Player.findOne({ where : { name : name } }).then(player => {
            if (!player) {
                return createPlayer(name);
            }
            return player;
        }).then(player => {
            return getPlayerStats(player.player_id);
        });
    }

    function getPlayerStats(playerId) {
        return Player.findById(playerId).then(player => {
            return {
                id : player.player_id,
                name : player.name,
                coins : player.coins
            };
        });
    }

    function createPlayer(name) {
        return Player.create({
            name : name,
            coins : PLAYER_STARTING_COINS
        }).then(player => {
            return createInventory(player).then(() => player);
        });
    }

    function createInventory(player) {
        var promises = [];
        return StartingInventory.findAll().then(items => {
            _.forEach(items, item => {
                promises.push(PlayerInventory.create({
                    player_id : player.player_id,
                    item_id : item.item_id,
                    quantity : item.quantity
                }));
            });
            return Promise.all(promises);
        });
    }

    return this;
};