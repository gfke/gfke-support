'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _lruCache2.default)({
    max: 16777216, // 16MB (UTF-8)
    maxAge: 1000 * 60 * 60 // global max age 1 hour
});