'use strict';

/**
 * The Auction Error object
 *
 * @param {string} message   the message
 * @param {number} code      the HTTP error code
 * @param {Object} [data]    aditional data to throw
 * @constructor
 *
 * @typedef {Error} AuctionError
 */
class AuctionError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code || 500;
        this.data = data || {};
        this.name = 'AuctionError';
    }
}

module.exports = function (acqua) {
    acqua.add('AuctionError', AuctionError);
};