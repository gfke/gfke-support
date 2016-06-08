'use strict';

const debug = require("debug")('gfke-support:services:cache:cache-context');

const _ = require('lodash');
const Promise = require('bluebird');

const MemoryCacheStrategy = require('./memory-cache-strategy');
const RedisCacheStrategy = require('./redis-cache-strategy');

/**
 * Singleton instance of the CacheContext
 */
var instance;

/**
 * Implements the current cache strategy and common cache behaviour
 */
module.exports = class CacheContext {
    constructor(monitor, cacheStrategy) {
        this.monitor = monitor;
        if(_.isString(cacheStrategy)) {
            this.strategy = cacheStrategy;
        } else {
            this._strategy = cacheStrategy;
        }
    }

    /**
     * List of available cache strategies
     * @returns {{Memory: string, Redis: string}}
     * @constructor
     */
    static get CacheStrategies() {
        return {
            Memory: 'memory',
            Redis: 'redis'
        };
    }

    /**
     * Get the singleton instance of the CacheContext
     * Creates it if none is present
     * @returns {*}
     */
    static getInstance() {
        if (_.isUndefined(instance)) {
            instance = new CacheContext(process.env.cacheStrategy); // TODO: WTF (>-.-)>
        }
        return instance;
    }

    /**
     * Sets the current cache strategy to one of the available strategies
     * @param strategy
     */
    set strategy(strategy) {
        switch (strategy.toLowerCase()) {
            case CacheContext.CacheStrategies.Memory:
                this._strategy = new MemoryCacheStrategy();
                break;
            case CacheContext.CacheStrategies.Redis:
                this._strategy = new RedisCacheStrategy();
                break;
            default:
                throw new Error(`${strategy} is not a valid cache strategy`);
        }
    }

    /**
     * Peek if the cache has a value for the given key
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {boolean}
     */
    has(key) {
        if (this.isAvailable) {
            return this._strategy.has(key)
                .then((has) => {
                    this.monitor.add('cache', (has ? 'hit' : 'miss'), 1);
                    return has;
                });
        }
    }

    /**
     * Returns the value stored under the current cache
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {object}
     */
    get(key) {
        if (this.isAvailable) {
            return this._strategy.get(key);
        }
    }

    /**
     * Write the provided data to the cache under the provided key
     *
     * @param {string} key Key under which the value should be stored
     * @param {object} value The data to store in cache
     */
    set(key, value) {
        if (_.isUndefined(value)) {
            const stack = new Error().stack;
            debug(`Tried to write 'undefined' into cache. CacheKey: ${key} \n Stack Trace: ${stack}`);
            return Promise.resolve(false);
        }

        if (this.isAvailable) {
            debug(`Setting key ${key} to value ${value}`);
            this.monitor.add('cache', 'set', 1);
            return this._strategy.set(key, value);
        }
    }

    /**
     * Return all cached keys
     *
     * @param {string} pattern Glob-style pattern describing the key to return
     * @returns {[string]}
     */
    keys(pattern) {
        return this._strategy.keys(pattern);
    }

    /**
     * Removes the value stored under the current cache
     *
     * @param {string} key Key under which the value is stored
     */
    remove(key) {
        this.monitor.add('cache', 'remove', 1);
        return this._strategy.remove(key);
    }

    /**
     * Indicates if the cache is available for operation
     *
     * @returns {boolean}
     */
    get isAvailable() {
        return this._strategy.isAvailable;
    }

    /**
     * Returns all keys currently in the cache
     * @returns {[string]}
     */
    dumpKeys() {
        return this._strategy.dumpKeys();
    }

    /**
     * Removes all keys that start with the provided string from the cache
     * @param {string} keyToRemove
     * @return {[string]} All keys that have been removed
     */
    *clearCacheEntriesStartingWith(keyToRemove) {
        const allKeys = yield this.keys(`${keyToRemove}*`);
        debug('Removing keys with pattern: ', `${keyToRemove}*`);
        debug('Keys hit ', allKeys);

        _.forEach(allKeys, (key) => {
            this.remove(key);
        });

        return allKeys;
    }
};
