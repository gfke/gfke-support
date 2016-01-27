'use strict';

import _ from 'lodash';
import HttpError from 'http-errors';

/**
 * Extract the shared secret from the provided context
 * It may be provided via header or query string parameter
 * @param {object} context Current koa context
 * @returns {string|null} The extracted shared secret
 */
function getSharedSecret(context) {
    const sharedSecretParameterName = 'x-mx-shared-secret';

    if (_.isUndefined(context.request.headers[sharedSecretParameterName]) === false) {
        return context.request.headers[sharedSecretParameterName];
    }

    if (_.isUndefined(context.request.query[sharedSecretParameterName]) === false) {
        return context.request.query[sharedSecretParameterName];
    }

    return null;
}

/**
 * Check if the current context provides a shared secret
 * If so check if the shared secret equals the configured one
 * @param {Generator} next
 */
export default function*(next) {
    const sharedSecret = getSharedSecret(this);
    if (_.isUndefined(sharedSecret) || _.isNull(sharedSecret)) {
        throw new HttpError('No shared secret provided on route ' + this.request.url, 401);
    }

    //If shared secret does not equal the configured one, throw a 401 - Forbidden
    if (sharedSecret !== process.env.sharedSecret) {
        throw new HttpError('Incorrect shared secret provided!', 401);
    }

    yield next;
}
