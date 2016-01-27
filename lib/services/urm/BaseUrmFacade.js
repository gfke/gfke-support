'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Maximum time between emitting event to URM and expecting answer event handler call
 * If the local Promise is not resolved bz an appropriate emitted event from the URM
 * we assume a wrong event was called that we never be handled by the URM and there for
 * will never emit any "response" event
 * To avoid waiting forever on a event that will never happen, we reject the Promise after
 * a timeout
 * Note: This of course breaks any calls that take longer than the timeout,
 * but no call on the URM should take so long
 * @type {number}
 */
const socketEmitTimeout = 5000;

/**
 * Base facade for simplified access to the URM service. Supports WebSockets as well as ReST.
 */

// FIXME: UNUSED IMPORT
class BaseUrmFacade {
    /**
     * @param {string} token Security token for URM Service
     */
    constructor(token) {
        this.urmBaseUrl = process.env.urmBaseUrl;
        this.urmBaseEvent = process.env.urmBaseEvent;
        this._token = token;
        this.socket = (0, _utils2.default)(process.env.urmSocketUrl);
    }

    get baseEvent() {
        return this._baseEvent;
    }

    /**
     * The current URM user token
     * @returns {string}
     */
    get token() {
        return this._token;
    }

    /**
     * Returns the user token in an object that the URM expects
     * @returns {{userToken: string}}
     */
    get tokenObject() {
        return { userToken: this.token };
    }

    /**
     * Appends the URM userToken to the provided object
     * @param {object} object Object to enrich with the URM user token
     * @returns {*}
     */
    appendTokenTo() {
        let object = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        object.userToken = this.token;
        return object;
    }

    /**
     * Performs a request to a specific URM endpoint
     *
     * @param {string} route
     * @param {object} data The data object, that will be sent with the request
     * @param {Function|undefined} transformFn Function to apply on the returned data
     * @returns {Promise.<T>}
     */
    query(route) {
        let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        let transformFn = arguments.length <= 2 || arguments[2] === undefined ? x => x : arguments[2];

        const uri = this.urmBaseUrl + this.baseEvent + route;

        return (0, _requestPromise2.default)({
            uri,
            method: 'POST',
            json: this.appendTokenTo(data),
            gzip: true,
            transform: data => {
                if (_lodash2.default.isUndefined(transformFn)) {
                    return data;
                }

                try {
                    return transformFn.call(null, data);
                } catch (e) {
                    throw new Error(`Error while transforming data. \nError ${ e.message } \nData${ data }`);
                }
            }
        }).catch(err => {
            if (_lodash2.default.isUndefined(err.statusCode) === false) {
                throw new _httpErrors2.default(err.message, err.statusCode);
            }
            throw new Error(err.message, { uri, data });
        });
    }

    /**
     * Emits an event on the URM socket
     *
     * @param {string} event The event the will be emitted to the URM API
     * @param {object} data The data object, that will be sent with the event
     * @param {function} transformFn Function to apply on the returned data
     * @returns {Promise.<T>}
     */
    emit(event) {
        let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        let transformFn = arguments.length <= 2 || arguments[2] === undefined ? x => x : arguments[2];

        //Save stack in case of error
        const stack = new Error().stack;
        event = this.urmBaseEvent + this.baseEvent + event;

        _utils.logger.debug('Emit WebSocket event', event, data);

        this.socket.emit(event, this.appendTokenTo(data));

        return new _bluebird2.default((resolve, reject) => {
            //TODO: Check if this might lead to memory leak as a new handler is registered each time this is called
            this.socket.on(event, data => {
                try {
                    if (data.status) {
                        resolve(transformFn.call(null, data));
                    } else {
                        reject(new _utils.SocketError(data.message, data.statusCode, stack));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).timeout(socketEmitTimeout).catch(_bluebird2.default.TimeoutError, () => {
            //If a TimeoutError occurred a wrong event was called, basically a WebSocket 404
            throw new _utils.SocketError('Socket event timed out - assuming wrong event', 500, stack);
        }).catch(error => {
            //If it was already an error re-throw it
            if (_lodash2.default.isError(error)) {
                throw error;
            }
            //Else throw a generic error
            throw new _utils.SocketError(error, 500, stack);
        });
    }
}
exports.default = BaseUrmFacade;