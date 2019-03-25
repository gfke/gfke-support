'use strict';

const debug = require('../../utils/debug')('gfke-support:services:dwh-api');
const join = require('join-path');
const requestPromise = require('request-promise');
const request = require('request');
const _ = require('lodash');

const requestRecorder = require('./requestRecorder');

const defaultOptions = {
    log: debug,
    tokenHeader: '',

    transformFn: x => x,
    transformErr: x => x,

    defaults: {
        dataSuffix: 'td',
        filterSuffix: ''
    },

    requestOptions: {
        method: 'POST',
        json: {},
        gzip: true,
        headers: {}
    },

    requestRecorder: {
        active: false,
        target: process.cwd() + "/dwhapi"
    },

    paths: {}
};

module.exports = class DwhApiService {
    /**
     * @param {object} options
     */
    constructor (options) {
        this._options = _.merge({}, defaultOptions, options);

        this.log.debug('setup dwh api');
        this.log.debug('setup dwh api url: %s', this._options.url);
        this.log.debug('setup dwh api options: %j', this._options);

        this._methods = {};
        this._rMethods = {};
        this.setupDwhApiMethods();
    }

    get log () {
        return this._options.log;
    }

    setupDwhApiMethods () {
        _.forEach(this._options.paths, (methods, action) => {
            const actionKey = _.upperFirst(_.camelCase(action));
            methods.forEach(m => {
                const mr = m.split(".").join("_").replace("/", "_");
                const methodKey = _.upperFirst(_.camelCase(mr));
                const queryMethod = `query${actionKey}${methodKey}`;
                const queryRMethod = `queryR${actionKey}${methodKey}`;

                this.log.debug('setup %s for %s', queryMethod, m);
                this[queryMethod] = (token, data, suffix, transformFn, transformErr) => {
                    return this.query(token, data, action, m, suffix, transformFn, transformErr);
                };

                this.log.debug('setup %s for %s', queryRMethod, m);
                this[queryRMethod] = (token, data, suffix, callback) => {
                    return this.queryR(token, data, action, m, suffix, callback);
                };
                this._methods[`${action}_${m}`] = this[queryMethod];
                this._rMethods[`${action}_${m}`] = this[queryRMethod];
            });
        });
    }

    get options () {
        return this._options;
    }

    get url () {
        return this._options.url;
    }

    get domain () {
        return this._options.domain;
    }

    get defaultTransformFn () {
        return this._options.transformFn;
    }

    get defaultTransformErr () {
        return this._options.transformErr;
    }

    set defaultTransformFn (transformFn) {
        this._options.transformFn = transformFn;
    }

    set defaultTransformErr (transformErr) {
        this._options.transformErr = transformErr;
    }

    get methods () {
        return this._methods;
    }

    methodForKey (key) {
        return this._methods[key];
    }

    get rMethods () {
        return this._rMethods;
    }

    rMethodForKey (key) {
        return this._rMethods[key];
    }

    /**
     * Performs a request against the DWH API and returns the response with a promise.
     * Passes the whole request body including request token from the submitted request object.
     * TODO: Replace long parameter list with object?
     *
     * @param {string} token
     * @param {object} model The model holding the filter values
     * @param {string} dataPath String to append to the dwhApi path
     * @param {string} dataSource String to append to the dwhApi path
     * @param {string} suffix PeriodMode on data sources, FilterName on filter sources
     * @param {Function|undefined} transformFn Function to tranform the response data
     * @param {Function|undefined} transformErr Function to tranform the error
     * @returns {Promise}
     */
    query (token, model, dataPath, dataSource, suffix, transformFn, transformErr) {

        let context;
        if (_.isString(token) || _.isUndefined(token.context) ) {
            context = null;
        } else {
            context = token.context;
            token = token.token;
        }

        if (dataPath == null) {
            dataPath = '';
        }

        if (transformFn == null) {
            transformFn = this.defaultTransformFn;
        }

        if (transformErr == null) {
            transformErr = this.defaultTransformErr;
        }

        let domainWithContext = this.domain;
        if (context !== null) {
            domainWithContext += '.' + context;
        }

        const uri = join(this.url, domainWithContext, dataPath, dataSource, suffix);
        this.log.info("Run Dwh Api Query for uri: %s", uri);
        this.log.info("Model: %j", model);
        this.log.info("Token: " + token);

        const requestOptions = _.cloneDeep(this.options.requestOptions);
        requestOptions.uri = uri;
        requestOptions.json = model || {};
        requestOptions.headers[this.options.tokenHeader] = token;
        requestOptions.transform = (data) => {
            this.log.info("Got Response from " + uri);

            if (this.options.requestRecorder.active) {
                // request recorder to record dwhapi callbacks
                requestRecorder(
                    join(dataPath, dataSource, suffix),
                    model,
                    data,
                    this.options.requestRecorder.target
                );
            }

            try {
                data = transformFn.call(null, data) || data;
            } catch (e) {
                e.data = data;
                throw e;
            }

            return data;
        };

        return this.queryRequestPromise(requestOptions, transformErr);
    }

    queryRequestPromise (requestOptions, transformErr) {
        return requestPromise(requestOptions).catch((err) => {
            if (err.statusCode === 500) {
                err.message = _.isUndefined(err.error) ? 'No error provided by DwhApi' : err.error.error;
            }
            err.requestOptions = requestOptions;

            try {
                transformErr.call(null, err, requestOptions, this.options);
            } catch (e) {
                throw e;
            }

            return err;
        });
    }

    queryR(token, model, dataPath, dataSource, suffix, callback) {
        let context;
        if (_.isString(token) || _.isUndefined(token.context) ) {
            context = null;
        } else {
            context = token.context;
            token = token.token;
        }

        if (dataPath == null) {
            dataPath = '';
        }

        let domainWithContext = this.domain;
        if (context !== null) {
            domainWithContext += '.' + context;
        }

        const uri = join(this.url, domainWithContext, dataPath, dataSource, suffix);
        this.log.info("Run Dwh Api Query for uri: %s", uri);

        const requestOptions = _.cloneDeep(this.options.requestOptions);
        requestOptions.uri = uri;
        requestOptions.json = model || {};
        requestOptions.headers[this.options.tokenHeader] = token;
        requestOptions.uri = uri;

        return this.queryRequest(requestOptions, callback);
    }

    queryRequest (requestOptions, callback) {
        return request(requestOptions, callback)
    }

    transform (data, transformers) {
        const originalData = _.cloneDeep(data);
        transformers.forEach(transformer => data = transformer(data, originalData) || data);
        return data;
    }
};
