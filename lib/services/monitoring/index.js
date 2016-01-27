'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraphiteMonitorStrategy = exports.NoopMonitorStrategy = exports.Monitor = undefined;

exports.default = function (customStrategy) {
    if (_lodash2.default.isUndefined(customStrategy)) {
        return new _Monitor2.default(strategy);
    }

    return new _Monitor2.default(customStrategy);
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Monitor = require('./Monitor.js');

var _Monitor2 = _interopRequireDefault(_Monitor);

var _NoopMonitorStrategy = require('./NoopMonitorStrategy.js');

var _NoopMonitorStrategy2 = _interopRequireDefault(_NoopMonitorStrategy);

var _GraphiteMonitorStrategy = require('./GraphiteMonitorStrategy.js');

var _GraphiteMonitorStrategy2 = _interopRequireDefault(_GraphiteMonitorStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Monitor = _Monitor2.default;
exports.NoopMonitorStrategy = _NoopMonitorStrategy2.default;
exports.GraphiteMonitorStrategy = _GraphiteMonitorStrategy2.default;

let strategy;

if (process.env.NODE_ENV === 'development') {
    strategy = new _NoopMonitorStrategy2.default();
} else {
    strategy = new _GraphiteMonitorStrategy2.default();
}