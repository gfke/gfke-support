'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseUrmFacade = require('./BaseUrmFacade.js');

var _BaseUrmFacade2 = _interopRequireDefault(_BaseUrmFacade);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _utils = require('../../utils');

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Facade for the user settings aspect of the URM service
 */
class UserSettingsFacade extends _BaseUrmFacade2.default {
    /**
     * @param token
     */
    constructor(token) {
        super(token);
        this._baseEvent = '/user-data';
    }

    /**
     * Get the complete user settings object
     *
     * @param {function} transformFn Function to apply on the returned data
     * @returns {*}
     */
    getUserSettings(transformFn) {
        const route = '/getSettings';
        return this.query(route, undefined, transformFn);
    }

    /**
     *
     * @param {string} dataPath
     * @param {function} transformFn Function to apply on the returned data
     * @returns {*}
     */
    getUserSettingsProperty(dataPath) {
        let transformFn = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

        const route = '/getSettingsProperty',
              dataObject = {
            dataPath
        };

        return this.query(route, dataObject, transformFn);
    }

    /**
     *
     * @param {object} data
     * @param {string} dataPath
     * @param {boolean} merge
     * @returns {*}
     */
    setUserSettingsProperty(data, dataPath) {
        let merge = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        const route = '/setSettingsProperty',
              object = {
            dataPath,
            value: data,
            merge
        };

        return this.query(route, object);
    }

    /**
     *
     * @param {string} dataPath
     * @returns {*}
     */
    removeUserSettingsProperty(dataPath) {
        const route = '/removeSettingsProperty',
              object = {
            dataPath
        };

        return this.query(route, object);
    }

    /**
     * Delete the complete user settings object
     *
     * @returns {*}
     */
    removeAllSettings() {
        const route = '/removeSettingsProperty',
              object = {
            dataPath: '.'
        };

        return this.query(route, object);
    }
}
exports.default = UserSettingsFacade;

// FIXME: UNUSED IMPORT