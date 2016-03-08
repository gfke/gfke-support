'use strict';

const debug = require("debug")('gfke-support:services:cache:redis-cache-strategy');

const url = require('url');
const _ = require('lodash');
const co = require('co');
const redis = require('redis');
const Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);

/**
 * Milliseconds before the redis cache is deemed unreachable
 * @type {number}
 */
var redisQueryTimeoutInMs = 1000;

/**
 * Interval in which the redis will be queried for availability
 * @type {number}
 */
const redisTimeOutIntervalInMs = 10 * 1000;

/**
 * A strategy to store values in redis cache
 * Only used on production where redis instance is available
 */
module.exports = class RedisCacheStrategy {
    constructor(options) {
        var self = this;
        this._options = options;
        /*
         * Parse the redis url and prepare connection settings.
         *
         * @see https://devcenter.heroku.com/articles/redistogo#using-with-node-js
         */
        const redisUrl        = options.redisUrl,
            redisDatabase   = parseInt(options.redisDatabase, 10) || 0,
            redisSettings   = url.parse(redisUrl),
            redisAuth       = redisSettings.auth.split(':'),
            originalTimeOut = redisQueryTimeoutInMs;

        //Set the timeout to a high value as the initial connection
        //takes longer than the normal commands, but will only happen once
        //on application start
        redisQueryTimeoutInMs = 2000;

        this._isReachable = false;

        this.cache = redis.createClient(
            redisSettings.port,
            redisSettings.hostname,
            {
                auth_pass: redisAuth[1]
            });

        this.cache.auth(redisAuth[1]);

        this.cache.on('error', (err) => {
            debug('Error on Redis Cache: ' + err);
        });

        this.cache.on('ready', ()=> {
            //Reset timeout to original value
            redisQueryTimeoutInMs = originalTimeOut;

            this.cache.select(redisDatabase, (err) => {
                if (err) {
                    debug('Error while selecting Redis Database: ' + err);
                    return;
                }

                self._isReachable = true;
            });
        });

        setInterval(this.checkAvailability.bind(this), redisTimeOutIntervalInMs);
    }

    log(method) {
        const args = _.tail(arguments);
        if(_.isUndefined(this._options.log) === false) {
            this._options.log[method](args);
        } else {
            this.debug("log disabled - start log via debug");
            this.debug(args);
            this.debug("finished log via debug");
        }
    }

    /**
     * Peek if the cache has a value for the given key
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {boolean}
     */
    has(key) {
        return co(function* () {
            return this.attachTimeout(this.cache.existsAsync(key));
        }.call(this));
    }

    /**
     * Returns the value stored under the current cache
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {object}
     */
    get(key) {
        return co(function* () {
            return JSON.parse(yield this.attachTimeout(this.cache.getAsync(key)));
        }.call(this));
    }

    /**
     * Write the provided data to the cache under the provided key
     *
     * @param {string} key Key under which the value should be stored
     * @param {object} value The data to store in cache
     */
    set(key, value) {
        return co(function* () {
            return this.attachTimeout(this.cache.setAsync(key, JSON.stringify(value)));
        }.call(this));
    }

    /**
     * Return all cached keys matching the pattern
     *
     * @param {string} pattern Pattern describing the key to return
     * @returns {[string]}
     */
    keys(pattern) {
        return co(function* () {
            return this.attachTimeout(this.cache.keysAsync(pattern));
        }.call(this));
    }

    /**
     * Removes the value stored under the current cache
     *
     * @param {string} key Key under which the value is stored
     */
    remove(key) {
        return co(function* () {
            return this.attachTimeout(this.cache.delAsync(key));
        }.call(this));
    }

    /**
     * Indicates if the cache is available for operation
     *
     * @returns {boolean}
     */
    get isAvailable() {
        return _.isUndefined(this.cache) === false
            &&
            this.cache.connected
            &&
            this.isReachable;
    }

    /**
     * Returns all keys currently in the cache
     * @returns {*}
     */
    dumpKeys() {
        return co(function* () {
            return this.keys('*');
        }.call(this));
    }

    /**
     * Flag that defines if the redis cache was unreachable last time it was called
     * @returns {boolean}
     */
    get isReachable() {
        return this._isReachable;
    }

    /**
     * Run empty query against redis to check availability
     */
    checkAvailability() {
        var self = this;
        this.attachTimeout(new Promise((resolve) => {
            this.cache.randomkey((error) => {
                if (_.isNull(error) === false) {
                    throw error;
                }
                self._isReachable = true;
                resolve(true);
            });
        }));
    }

    /**
     *
     * @param promise
     * @returns {*}
     */
    attachTimeout(promise) {
        return promise.timeout(redisQueryTimeoutInMs)
            .catch((error) => {
                debug(`Redis cache timed out or threw error: ${error}`);
                this._isReachable = false;
            });
    }
};
