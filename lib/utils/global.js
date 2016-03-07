'use strict';

const _ = require('lodash');
const sprintf = require('sprintf-js').sprintf;

const log = require('debug')('gfke-support:utils:global');

exports.expose = function(item, key, force) {
  if(force == null) {
    force = false;
  }

  if (global[key] && !force) {
    log("Could not expose " + key + ". Key is already in use.");
    return false;
  }
  log("Expose " + key);
  return global[key] = item;
};

exports.exposeMany = function(objects, format) {
  if (format == null) {
    format = '%s';
  }
  var results = [];
  for (var key in objects) {
    var object = objects[key];
    if (_.isFunction(format)) {
      results.push(exports.expose(object, format(key)));
    } else {
      results.push(exports.expose(object, sprintf(format, key)));
    }
  }
  return results;
};
