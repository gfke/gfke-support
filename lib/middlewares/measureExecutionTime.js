'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function* (next) {
    const start = new Date();

    yield next;

    monitor.put('koa', 'execution_time', new Date() - start);
};

var _services = require('../../services');

var _services2 = _interopRequireDefault(_services);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FIXME: This is a really bad solution. Monitor should be part of app
const monitor = _services2.default.monitoring();