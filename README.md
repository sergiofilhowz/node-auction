I chose to use the following technologies:

# On the backend
* express
* sequelize
* socket.io
* acqua
* saphyre-data
* mysql
* jwt

# On the frontend
* ngMaterial
* pascalprecht.translate
* socket.io
* sass
* gulp

The code is 100% localized but with en_US language only.

Tests on the backend were developed with mocha.
Tests on the frontend were developed with jasmine + karma.

NodeJS version used was 4.2.1

# Instructions on how to install

## Must have global npm modules
    $ npm install gulp -g
    $ npm install bower -g
    
    $ npm install
    $ bower install
    $ gulp

## Before start
    - configure config/default.json file
    - run deployment/create_schema.sql on your mysql database
    - run deployment/create_data.sql on your mysql database

## To start
    - npm start (env variable AUCTION_PORT to define another port)

## Before test backend
    - create a new mysql database instance
    - configure config/test.json file

## To test backend
    - npm test
    - npm run cover (for coverage report)

## To test front end
    - karma start
    - COVERAGE=true karma start (for coverage report)