'use strict';

const _ = require('lodash');

const CacheContext = require('./cache-context.js');
const MemoryCacheStrategy = require('./memory-cache-strategy.js');
const RedisCacheStrategy = require('./redis-cache-strategy.js');
const RedisSentinelCacheStrategy = require('./redis-sentinel-cache-strategy.js');


exports = module.exports = function(monitor, strategy, opts) {
    if(opts == null) {
        opts = {};
    }

    let cacheStrategy = null;

    if(_.isUndefined(strategy)) {
        cacheStrategy = new MemoryCacheStrategy();
    } else if(_.isString(strategy)) {
        switch(strategy) {
            case 'memory':
                cacheStrategy = new MemoryCacheStrategy();
                break;
            case 'redis':
                cacheStrategy = new RedisCacheStrategy(opts);
                break;
            case 'redis-sentinel':
                cacheStrategy = new RedisSentinelCacheStrategy(opts);
                break;
        }
    } else {
        cacheStrategy = strategy;
    }

    return new CacheContext(monitor, cacheStrategy);
};

exports.CacheContext = CacheContext;
exports.MemoryCacheStrategy = MemoryCacheStrategy;
exports.RedisCacheStrategy = RedisCacheStrategy;
