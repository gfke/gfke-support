'use strict';

const cacheResult = require('./cache-result');
const cleanBodyFields = require('./clean-body-fields');
const error = require('./error');
const longPoll = require('./long-poll');
const measureExecutionTime = require('./measure-execution-time');
const runAfter = require('./run-after');
const requiredHeaderKey = require('./required-header-key');
const headerKey = require('./header-key');

module.exports = {
    cacheResult: cacheResult,
    cleanBodyFields: cleanBodyFields,
    error: error,
    longPoll: longPoll,
    measureExecutionTime: measureExecutionTime,
    runAfter: runAfter,
    requiredHeaderKey: requiredHeaderKey,
    headerKey: headerKey
};
