'use strict';
const _ = require('lodash');
const co = require('co');
const redis = require('redis-sentinel');
const Promise = require('bluebird');

const debug = require('debug')('gfke-support:services:cache:redis-sentinel-cache-strategy');

/**
 * Milliseconds before the redis cache is deemed unreachable
 * @type {number}
 */
let redisQueryTimeoutInMs = 30000;

/**
 * Interval in which the redis will be queried for availability
 * @type {number}
 */
const redisTimeOutIntervalInMs = 30000;

/**
 * A strategy to store values in redis cache
 * Only used on production where redis instance is available
 */
module.exports = class RedisSentinelCacheStrategy {
    constructor(options) {
        this._options = options;

        const sentinels = options.redisSentinel.split(',').map(x => {
            x = x.split(':');
            return {host: x[0], port: parseInt(x[1] || '26379', 10)}
        });
        const master = options.redisSentinelMaster;
        const password = options.redisSentinelPassword;
        const options = {
            db: parseInt(options.redisSentinelDatabase, 10)
        }
        const originalTimeOut = redisQueryTimeoutInMs;
        this._isReachable = false;

        this.cache = redis.createClient(
            sentinels,
            master,
            options
        );

        Promise.promisifyAll(this.cache);

        let authPromise = Promise.resolve();
        if (password) {
            authPromise = this.cache.authAsync(password);
        }

        this.cache.on('error', (err) => {
            debug('Error on Redis Cache: ' + err);
        });

        this.cache.on('ready', () => {
            //Reset timeout to original value
            redisQueryTimeoutInMs = originalTimeOut;

            authPromise.then(() => {
                this.cache.selectAsync(options.db, (err) => {
                    if (err) {
                        debug('Error while selecting Redis Database: ' + err);
                        return;
                    }

                    this._isReachable = true;
                });
            })
        });

        setInterval(this.checkAvailability.bind(this), redisTimeOutIntervalInMs)
    }

    /**
     * Peek if the cache has a value for the given key
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {boolean}
     */
    has(key) {
        return co(function* () {
            debug(`has "${key}"`);
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
            debug(`get "${key}"`);
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
            debug(`set "${key}"`);
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
            debug(`del "${key}"`);
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
    dumpKeys(pattern) {
        return co(function* () {
            return this.keys(pattern);
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
        this.attachTimeout(new Promise((resolve) => {
            this.cache.randomkey((error) => {
                if (_.isNull(error) === false) {
                    throw error;
                }
                this._isReachable = true;
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
                          log.error(`Redis cache timed out or threw error: ${error}`);
                          this._isReachable = false;
                      });
    }

    get length() {
        return co(function* () {
            // todo: implement with INFO command
            return -1;
        }.call(this));
    }
}
