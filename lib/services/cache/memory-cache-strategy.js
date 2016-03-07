'use strict';

const _ = require('lodash');
const co = require('co');
const lruCache = require('lru-cache');

/**
 * A strategy to store values in a in-memory cache
 * Used mainly in development, staging or other environments
 * where no Redis instance is available
 */
module.exports = class MemoryCacheStrategy {
    constructor() {
        this.cache = lruCache({
            max: 16777216, // 16MB (UTF-8)
            maxAge: 1000 * 60 * 60 // global max age 1 hour
        });
    }

    /**
     * Peek if the cache has a value for the given key
     *
     * @param {string} key Key under which the desired value is stored
     * @returns {boolean}
     */
    has(key) {
        return co(function* () {
            return this.cache.has(key);
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
            return this.cache.get(key);
        }.call(this));
    }

    /**
     * Write the generated export to the file system using the provided path
     *
     * @param {string} key Key under which the value should be stored
     * @param {string} key Key under which the value should be stored
     * @param {object} value The data to store in cache
     */
    set(key, value) {
        return co(function* () {
            this.cache.set(key, value);
        }.call(this));
    }

    /**
     * Return all cached keys
     *
     * @param {string} pattern Glob-style pattern describing the key to return
     * @returns {[string]}
     */
    keys(pattern) {
        return co(function* () {
            //create valid regex from glob-style pattern
            pattern = pattern.replace('*','.*');

            const regExp  = new RegExp(pattern),
                allKeys = yield this.cache.keys();

            return _.filter(allKeys, function(key) {
                return regExp.test(key);
            })
        }.call(this));
    }

    /**
     * Removes the value stored under the current cache
     *
     * @param {string} key Key under which the value is stored
     */
    remove(key) {
        return co(function* () {
            this.cache.del(key);
        }.call(this));
    }

    /**
     * Indicates if the cache is available for operation
     *
     * @returns {boolean}
     */
    get isAvailable() {
        return _.isUndefined(this.cache) === false;
    }

    /**
     * Returns all keys currently in the cache
     * @returns {*}
     */
    dumpKeys() {
        return co(function* () {
            return yield this.keys('.+');
        }.call(this));
    }
};
