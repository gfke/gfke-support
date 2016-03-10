'use strict';

const debug = require("debug")('gfke-support:services:urm');

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
    
    transformFn: x => x,
    transformErr: x => x,
    
    socket: {
        url: '',
        baseEvent: '',
        emitTimeout: 5000,
        options: {
            autoConnect: true,
            transports: ['websocket'],
            reconnection: true,
            // Retry every 20 sec
            reconnectionDelay: 20000
        },
        events: {
            connect: function(socketOptions) {
                debug('socket - connection established');
            },
            connect_error: function(error) {
                debug('socket - connection error');
                // debug('url was %s', socketOptions.url);
                debug(error);
            },
            error:function(error) {
                debug('socket - error %s', error);
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
        this.debug = debug;
        
        this.debug('setup urm');
        this.debug('setup urm url: %s', this._options.url);
        this.initSocket();
        this.setupUrmMethods();
    }
    
    initSocket() {
        this.debug('setup urm socket');
        this.debug('setup urm socket url: %s', this._options.socket.url);
        this.debug('setup urm socket baseEvent: %s', this._options.socket.baseEvent);
        this.debug('setup urm socket options: %j', this._options.socket.options);
        this._socket = socketClient(
            this._options.socket.url,
            this._options.socket.options
        );
        
        _.forEach(this._options.socket.events, (v, k) => {
            this.debug('setup urm socket event %s', k);
            this._socket.on(k, v);
        });
    }
    
    setupUrmMethods() {
        _.forEach(this._options.paths, (methods, action) => {
            const actionKey = _.upperFirst(_.camelCase(action));
            methods.forEach( m => {
                const methodKey = _.upperFirst(m);
                const queryMethod = `query${actionKey}${methodKey}`;
                const emitMethod = `emit${actionKey}${methodKey}`;

                this.debug('setup %s', queryMethod);
                this[queryMethod] = function(data, transformFn, transformErr) {
                    return this.query(action, m, data, transformFn, transformErr);
                };
                
                this.debug('setup %s', emitMethod);
                this[emitMethod] =function(data, transformFn, transformErr) {
                    return this.emit(action, m, data, transformFn, transformErr);
                };
            });
        });
    }
    
    log(method) {
        const args = _.tail(arguments);
        if(_.isUndefined(this._options.log) === false) {
            this._options.log[method](args);
        } else {
            this.debug("log disabled - start log via debug");
            this.debug(args);
            this.debug("finished log via debug");
        }
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
    
    set defaultTransformFn(transformFn) {
        this._options.transformFn = transformFn;
    }
    
    set defaultTransformErr(transformErr) {
        this._options.transformErr = transformErr;
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
        this.debug("Run URM Query for uri: %s", uri);
        this.debug("Data: %j", data);
        if(data.userToken) {
            this.debug("Token: %s", data.userToken);
        }
        
        const requestOptions = this.options.requestOptions;
        requestOptions.uri = uri;
        requestOptions.json = data|| {};
        requestOptions.transform = (data) => {
            this.debug("Got Response from %s", uri);
            this.debug(data);
            
            try {
                data = transformFn.call(null, data);
            } catch (e) {
                e.data = data;
                this.debug(e);
                throw e;
            }
            
            return data;
        };
        
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

        this.debug('Emit URM Socket event %s', event);
        this.debug('Data:', data);

        this._socket.emit(event, data);

        return new bluebird((resolve, reject) => {
            /* 
             * TODO: Check if this might lead to memory leak as a 
             *       new handler is registered each time this is called
             */
            this._socket.on(event, data => {
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
