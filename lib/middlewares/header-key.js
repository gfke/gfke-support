'use strict';

const _ = require('lodash');

module.exports = function(headerKey, target) {
    if(target == null) {
        target = _.camelCase(headerKey);
    }
    
    return function* headerKeyToken(next) {
        this.request[target] = this.get(headerKey) || null;
        yield next;
    };
};
