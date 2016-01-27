'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function* (next) {
    const sharedSecret = getSharedSecret(this);
    if (_lodash2.default.isUndefined(sharedSecret) || _lodash2.default.isNull(sharedSecret)) {
        throw new _httpErrors2.default('No shared secret provided on route ' + this.request.url, 401);
    }

    //If shared secret does not equal the configured one, throw a 401 - Forbidden
    if (sharedSecret !== process.env.sharedSecret) {
        throw new _httpErrors2.default('Incorrect shared secret provided!', 401);
    }

    yield next;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extract the shared secret from the provided context
 * It may be provided via header or query string parameter
 * @param {object} context Current koa context
 * @returns {string|null} The extracted shared secret
 */
function getSharedSecret(context) {
    const sharedSecretParameterName = 'x-mx-shared-secret';

    if (_lodash2.default.isUndefined(context.request.headers[sharedSecretParameterName]) === false) {
        return context.request.headers[sharedSecretParameterName];
    }

    if (_lodash2.default.isUndefined(context.request.query[sharedSecretParameterName]) === false) {
        return context.request.query[sharedSecretParameterName];
    }

    return null;
}

/**
 * Check if the current context provides a shared secret
 * If so check if the shared secret equals the configured one
 * @param {Generator} next
 */