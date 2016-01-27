'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function* (next) {
    this.token = getToken(this);
    if (_lodash2.default.isUndefined(this.token) || _lodash2.default.isNull(this.token)) {
        this.throw(new _httpErrors2.default('No URM token provided on route ' + this.request.url, 401));
    }
    yield next;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getToken(context) {
    if (context.isWebSocket) {
        throw new Error('SecurityToken from WebSocket not implemented');
    }
    return context.request.headers['x-mx-reqtoken'];
}

/**
 * Decorate context with URM token
 * If none was found, throw error
 * Attach this to all routes that need dwhApi access
 * @param next
 */