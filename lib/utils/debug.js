'use strict';

const debug = require('debug');

const log = debug("gfke-support:utils:debug");

module.exports = function(mainLoggerName) {
  var log = debug(mainLoggerName);
  log.childLogger = function(subLoggerName) {
    return module.exports(mainLoggerName+":"+subLoggerName);
  };
  return log;
};
