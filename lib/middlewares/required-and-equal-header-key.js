'use strict';

const _ = require('lodash');

module.exports = function(headerKey, key, target, errorCallback) {
    if(target == null) {
        target = _.camelCase(headerKey);
    }
    
    if(errorCallback == null) {
        errorCallback = function *(next) {
            this.throw(401, `Required Header ${headerKey} not provided or invalid`);
        };
    }
    
    return function* headerKeyToken(next) {
        this.request[target] = this.get(headerKey) || null;
        if(this.request[target] == null || this.request[target] !== key) {
            return yield errorCallback.call(this, next);
        }
        
        yield next;
    };
};
