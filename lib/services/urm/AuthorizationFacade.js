'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseUrmFacade = require('./BaseUrmFacade.js');

var _BaseUrmFacade2 = _interopRequireDefault(_BaseUrmFacade);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Facade for the authorization aspect of the URM service
 */
class AuthorizationFacade extends _BaseUrmFacade2.default {
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
        const event = '/getPermissions';
        return this.emit(event, {
            permissionName: 'bookdach.*'
        });
    }
}
exports.default = AuthorizationFacade;

// FIXME: UNUSED IMPORT