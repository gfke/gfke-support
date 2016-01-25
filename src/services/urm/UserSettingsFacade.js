'use strict';

import BaseUrmFacade from './BaseUrmFacade.js';

// FIXME: UNUSED IMPORT
import socketClient from 'socket.io-client';
import cache from './utils/cache.js';
import co from 'co';

/**
 * Facade for the user settings aspect of the URM service
 */
export default class UserSettingsFacade extends BaseUrmFacade {
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
    getUserSettingsProperty(dataPath, transformFn = undefined) {
        const route      = '/getSettingsProperty',
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
    setUserSettingsProperty(data, dataPath, merge = false) {
        const route  = '/setSettingsProperty',
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
        const route  = '/removeSettingsProperty',
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
        const route  = '/removeSettingsProperty',
              object = {
                  dataPath: '.'
              };

        return this.query(route, object);
    }
}
