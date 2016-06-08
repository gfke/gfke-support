'use strict';


const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const joinPath = require('join-path');
const debug = require('debug')('gfke-support:services:dwh-api:request-recorder');
function reformat(key) {
    key = key.replace('/', '.');
    return _.snakeCase(key);
}

module.exports = function (key, model, result, target) {
    if (fs.existsSync(target) === false) {
        fs.mkdirSync(target);
    }

    if(model == null) {
        model = {};
    }

    if ((_.isUndefined(model.startDate) || _.isUndefined(model.endDate)) === false) {
        key = joinPath(model.startDate, "_", model.endDate, "_", key);
        debug(`Key for Period: ${ key }`);
    }

    if ((_.isUndefined(model.start) || _.isUndefined(model.end)) === false) {
        key = joinPath(model.start, "_", model.end, "_", key);
        debug(`Key for Period: ${ key }`);
    }

    const reformattedKey = reformat(key),
          rtarget = path.resolve(target, `${ reformattedKey }.json`);

    debug(`Write for key: ${ reformattedKey }`);
    debug(`Write to: ${ rtarget }`);
    debug(`Result: ${ result }`);

    fs.writeFileSync(rtarget, JSON.stringify(result, null, '  '));
};
