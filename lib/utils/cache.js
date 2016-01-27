'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    let opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    (0, _lruCache2.default)(_lodash2.default.merge({
        max: 16777216, // 16MB (UTF-8)
        maxAge: 1000 * 60 * 60 // global max age 1 hour
    }, opts));
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }