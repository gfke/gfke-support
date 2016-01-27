'use strict';

import BaseUrmFacade from './BaseUrmFacade.js';

// FIXME: UNUSED IMPORT
import {cache} from '../../utils';

/**
 * Facade for the authorization aspect of the URM service
 */
export default class AuthorizationFacade extends BaseUrmFacade {
    /**
     * @param {string} token Security token for URM Service
     */
    constructor(token) {
        super(token);
        this._baseEvent = '/authorization';
    }

    /**
     * Returns the checksum for the current permission set by the submitted user token.
     * Tries to restore the checksum from cache if once fetched, which improves processing time by factor 100.
     *
     * @returns {Promise}
     */
    getPermissions() {
        const event    = '/getPermissions';
        return this.emit(event, {
            permissionName: 'bookdach.*'
        });
    }
}
