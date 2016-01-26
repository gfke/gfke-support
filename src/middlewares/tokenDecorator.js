'use strict';

import _ from 'lodash';
import HttpError from 'http-errors';

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
export default function*(next) {
    this.token = getToken(this);
    if (_.isUndefined(this.token) || _.isNull(this.token)) {
        this.throw(new HttpError('No URM token provided on route ' + this.request.url, 401))
    }
    yield next;
}
