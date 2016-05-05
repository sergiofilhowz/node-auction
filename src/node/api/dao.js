var _ = require('lodash'),
    Sequelize = require('sequelize'),
    path = require('path');

module.exports = function dao(acqua, config) {

    var models = {},
        sequelize,
        database = config.database,
        dialect = database.dialect || 'mysql',
        logging = database.logging ? console.log : false;

    sequelize = new Sequelize(database.name, database.username, database.password, {
        host : database.host,
        port : database.port,
        logging : logging,

        maxConcurrentQueries: 50,

        dialect : dialect,

        dialectOptions : {
            socketPath : database.socketPath,
            supportBigNumbers : true,
            bigNumberStrings : true
        },

        define : {
            underscored : true,
            freezeTableName : false,
            syncOnAssociation : true,
            charset : 'utf8',
            collate : 'utf8_general_ci',
            timestamps : true,
            constraints : false,

            updatedAt : 'updated_at',
            createdAt : 'created_at',
            deletedAt : 'removed_at',

            paranoid : false
        },

        sync : { force : false },
        syncOnAssociation : true,
        pool : database.pool,
        language : 'en'
    });

    /**
     * Will recursively load models in a given folder
     *
     * @param {string} moduleName  Models namespace
     * @param {string} dir         Folder to load models
     */
    this.loadModels = function (moduleName, dir) {
        models[moduleName] = models[moduleName] || {};

        var modelsModule = models[moduleName];

        acqua.loadDir(dir, path => {
            var model = sequelize.import(path);
            modelsModule[model.name] = model;
        });
    };

    /**
     * Will associate all loaded models
     */
    this.associateModels = function () {
        _.forEach(models, moduleModel => {
            _.forEach(moduleModel, model => {
                if (model.hasOwnProperty('associate')) {
                    model.associate(models);
                }
            });
        });
    };

    this.sync = function (options) {
        return sequelize.sync(options);
    };

    this.loadModels('auction', path.join(__dirname, '..', 'models'));
    this.associateModels();

    acqua.add('models', models);
    acqua.add('sequelize', sequelize);

    this.models = models;
    this.sequelize = sequelize;

    return this;
}