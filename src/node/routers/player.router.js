var express = require('express'),
    jwt = require('jsonwebtoken');

module.exports = function playerRouter(app, playerService, inventoryModel, config) {
    var router = express.Router();

    router.post('/login', playerLogin);
    router.get('/inventory', getPlayerInventory);
    router.get('/stats', getPlayerStats);

    function playerLogin(request) {
        var name = request.body.name;
        request.handle(playerService.loginOrCreate(name).then(user => {
            return { token : jwt.sign({ id : user.id }, config.secret) }; // generate the token
        }));
    }

    function getPlayerInventory(request) {
        // no need to handle the exception on request.getPlayerId()
        request.getPlayerId().then(id => {
            request.handle(inventoryModel.getPlayerInventory(id));
        });
    }

    function getPlayerStats(request) {
        // no need to handle the exception on request.getPlayerId()
        request.getPlayerId().then(id => {
            request.handle(playerService.getPlayerStats(id));
        });
    }

    app.use('/player', router);

    this.router = router;

    return this;
};