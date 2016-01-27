'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import requestPromise from 'request-promise';

import {SocketError, default as Socket} from '../../utils';
import HttpError from 'http-errors';

import {logger} from '../../utils';

// FIXME: UNUSED IMPORT
import socketClient from 'socket.io-client';
import co from 'co';
import {cache} from '../../utils';

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
export default class BaseUrmFacade {
    /**
     * @param {string} token Security token for URM Service
     */
    constructor(token) {
        this.urmBaseUrl = process.env.urmBaseUrl;
        this.urmBaseEvent = process.env.urmBaseEvent;
        this._token = token;
        this.socket = Socket(process.env.urmSocketUrl);
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
        return {userToken: this.token};
    }

    /**
     * Appends the URM userToken to the provided object
     * @param {object} object Object to enrich with the URM user token
     * @returns {*}
     */
    appendTokenTo(object = {}) {
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
    query(route, data = {}, transformFn = x=>x) {
        const uri = this.urmBaseUrl + this.baseEvent + route;

        return requestPromise({
            uri,
            method: 'POST',
            json: this.appendTokenTo(data),
            gzip: true,
            transform: (data) => {
                if(_.isUndefined(transformFn)){
                    return data;
                }

                try {
                    return transformFn.call(null, data);
                } catch (e) {
                    throw new Error(`Error while transforming data. \nError ${e.message} \nData${data}`);
                }
            }
        }).catch((err) => {
            if (_.isUndefined(err.statusCode) === false) {
                throw new HttpError(err.message, err.statusCode);
            }
            throw new Error(err.message, {uri, data});
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
    emit(event, data = {}, transformFn = x=>x) {
        //Save stack in case of error
        const stack = new Error().stack;
        event = this.urmBaseEvent + this.baseEvent + event;

        logger.debug('Emit WebSocket event', event, data);

        this.socket.emit(event, this.appendTokenTo(data));

        return new Promise((resolve, reject) => {
            //TODO: Check if this might lead to memory leak as a new handler is registered each time this is called
            this.socket.on(event, (data) => {
                try {
                    if (data.status) {
                        resolve(transformFn.call(null, data));
                    } else {
                        reject(new SocketError(data.message, data.statusCode, stack));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        })
            .timeout(socketEmitTimeout)
            .catch(Promise.TimeoutError, () => {
                //If a TimeoutError occurred a wrong event was called, basically a WebSocket 404
                throw new SocketError('Socket event timed out - assuming wrong event', 500, stack);
            })
            .catch((error) => {
                //If it was already an error re-throw it
                if (_.isError(error)) {
                    throw error;
                }
                //Else throw a generic error
                throw new SocketError(error, 500, stack);
            });
    }
}
