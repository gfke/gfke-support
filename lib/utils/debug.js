'use strict';

const debug = require('debug');

module.exports = function(mainLoggerName) {
  var log = debug(mainLoggerName);
  log.childLogger = function(subLoggerName) {
    return module.exports(mainLoggerName+":"+subLoggerName);
  };

  log.trace = debug
  log.debug = debug
  log.info = debug
  log.warn = debug
  log.error = debug
  log.fatal = debug
  return log;
};
