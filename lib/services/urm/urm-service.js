'use strict';

const debug = require('../../utils/debug')('gfke-support:services:urm');

const _ = require('lodash');
const socketClient = require('socket.io-client');
const bluebird = require('bluebird');
const requestPromise = require('request-promise');
const join = require('join-path');

const SocketError = require('./socket-error');
const urmHelper = require('./urm-helper');

const defaultOptions = {

    requestOptions: {
        method: 'POST',
        json: {},
        gzip: true,
        headers: {}
    },

    log: debug,

    transformFn: x => x,
    transformErr: x => x,
    beforeQuery: x => x,
    beforeEmit: x => x,

    socket: {
        url: '',
        baseEvent: '',
        emitTimeout: 5000,
        socketClient: socketClient,
        options: {
            autoConnect: true,
            transports: ['websocket'],
            reconnection: true,
            // Retry every 20 sec
            reconnectionDelay: 20000
        },
        events: {
            connect: function(socketOptions) {
                this.log.debug('socket - connection established');
            },
            connect_error: function(error) {
                this.log.error('socket - connection error');
                // debug('url was %s', socketOptions.url);
                this.log.error(error);
            },
            error:function(error) {
                this.log.error('socket - error %s', error);
            }
            // connect_timeout:
            // reconnect:
            // reconnect_attempt:
            // reconnecting:
            // ping:
            // pong:
        }
    },
    paths: {},
    SocketError: SocketError
};

exports = module.exports = class URMService {
    /**
     * @param {object} options
     */
    constructor(options) {
        this._options = _.merge({}, defaultOptions, options);
        this.log.debug('setup urm');
        this.log.debug('setup urm url: %s', this._options.url);
        this.initSocket();
        this.setupUrmMethods();
    }

    initSocket() {
        this.log.debug('setup urm socket url: %s', this._options.socket.url);
        this.log.debug('setup urm socket baseEvent: %s', this._options.socket.baseEvent);
        this.log.debug('setup urm socket options: %j', this._options.socket.options);

        this._socket = this._options.socketClient(
            this._options.socket.url,
            this._options.socket.options
        );

        _.forEach(this._options.socket.events, (v, k) => {
            this.log.trace('setup urm socket event %s', k);
            this._socket.on(k, v.bind(this));
        });
    }

    setupUrmMethods() {
        _.forEach(this._options.paths, (methods, action) => {
            const actionKey = _.upperFirst(_.camelCase(action));
            methods.forEach( m => {
                const methodKey = _.upperFirst(m);
                const queryMethod = `query${actionKey}${methodKey}`;
                const emitMethod = `emit${actionKey}${methodKey}`;

                this.log.trace('setup %s', queryMethod);
                this[queryMethod] = function(data, transformFn, transformErr) {
                    return this.query(action, m, data, transformFn, transformErr);
                };

                this.log.trace('setup %s', emitMethod);
                this[emitMethod] =function(data, transformFn, transformErr) {
                    return this.emit(action, m, data, transformFn, transformErr);
                };
            });
        });
    }

    get log() {
        return this._options.log;
    }

    get socket() {
        return this._socket;
    }

    get options() {
        return this._options;
    }

    get url() {
        return this._options.url;
    }

    get baseEvent() {
        return this._options.socket.baseEvent;
    }

    get defaultTransformFn() {
        return this._options.transformFn;
    }

    get defaultTransformErr() {
        return this._options.transformErr;
    }

    get defaultBeforeQuery() {
        return this._options.beforeQuery;
    }

    get defaultBeforeEmit() {
        return this._options.beforeEmit;
    }

    set defaultTransformFn(transformFn) {
        this._options.transformFn = transformFn;
    }

    set defaultTransformErr(transformErr) {
        this._options.transformErr = transformErr;
    }

    set defaultBeforeQuery(beforeQuery) {
        this._options.beforeQuery = beforeQuery;
    }

    set defaultBeforeEmit(beforeEmit) {
        this._options.beforeEmit = beforeEmit;
    }

    get helper() {
        return urmHelper;
    }

    /**
     * @param {string} action
     * @param {string} route
     * @param {object} data
     * @param {Function|undefined} transformFn Function to tranform the response data
     * @param {Function|undefined} transformErr Function to tranform the error
     * @returns {Promise}
     */
    query(action, route, data, transformFn, transformErr) {
        if(data == null) {
            data = {};
        }

        if(transformFn == null) {
            transformFn = this.defaultTransformFn;
        }

        if(transformErr == null) {
            transformErr = this.defaultTransformErr;
        }

        const uri = join(this.url, action, route);
        const requestOptions = this.options.requestOptions;
        requestOptions.uri = uri;
        requestOptions.json = data|| {};
        requestOptions.transform = (data) => {
            this.log.debug("Got Response from %s", uri);
            this.log.debug(data);

            try {
                data = transformFn.call(null, data);
            } catch (e) {
                e.data = data;
                throw e;
            }

            return data;
        };

        if (_.isFunction(this.beforeQuery)) {
            this.beforeQuery.call(this, requestOptions);
        }
        this.log.info("Run URM Query for uri: %s", uri);
        return requestPromise(requestOptions).catch((error) => {
            if (_.isUndefined(error.message)) {
                error.message = error.error.message;
            }

            if (_.isUndefined(error.statusCode)) {
                error.statusCode = 500;
            }

            error.requestOptions = requestOptions;

            try {
                error = transformErr.call(null, error, requestOptions, this.options);
            } catch (e) {
                throw e;
            } finally {
                throw error;
            }
        });
    }

    /**
     * @param {string} action
     * @param {string} event
     * @param {object} data
     * @param {Function|undefined} transformFn Function to tranform the response data
     * @param {Function|undefined} transformErr Function to tranform the error
     * @returns {Promise}
     */
    emit(action, event, data, transformFn, transformErr) {
        if(data == null) {
            data = {};
        }

        if(transformFn == null) {
            transformFn = this.defaultTransformFn;
        }

        if(transformErr == null) {
            transformErr = this.defaultTransformErr;
        }

        // Save stack in case of error
        const stack = new Error().stack;
        event = join(this.baseEvent, action, event);

        this.log.info('Emit URM Socket event %s', event);
        if (_.isFunction(this.beforeEmit)) {
            this.beforeEmit.call(this, event, data);
        }

        this._socket.emit(event, data);

        return new bluebird((resolve, reject) => {
            this._socket.once(event, data => {
                try {
                    if (data.status) {
                        resolve(transformFn.call(null, data));
                    } else {
                        reject(new this.options.SocketError(
                            data.message, data.statusCode,
                            stack
                        ));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        })
        .timeout(this.options.socket.emitTimeout)
        .catch(bluebird.TimeoutError, () => {
            // If a TimeoutError occurred a wrong event was called,
            // basically a WebSocket 404
            throw new SocketError(
                'Socket event timed out - assuming wrong event',
                500,
                stack
            );
        })
        .catch(error => {
            if (_.isError(error) === false) {
                error = new SocketError(error, 500, stack);
            }

            error.event = event;
            error.socket = this.options.socket;
            error.data = data;

            try {
                error = transformErr.call(null, error, {
                    event: event,
                    data: data
                }, this.options);
            } catch (e) {
                throw e;
            } finally {
                throw error;
            }
        });
    }
};
