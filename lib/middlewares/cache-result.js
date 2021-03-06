'use strict';

const _ = require('lodash');

module.exports = function(cacheKey) {
    return function*(next) {
        const key = _.isFunction(cacheKey) ? cacheKey() : cacheKey;

        if(this.app.context.cache.has(key)){
            this.body = this.app.context.cache.get(key);
        } else {
            yield next;

            if (_.isUndefined(this.body)) {
                this.log.info('Result is undefined. Will cache null. Key: %s', key);
                this.body = null;
            }

            this.app.context.cache.set(key, this.body);
        }
    };
};
