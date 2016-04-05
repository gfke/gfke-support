'use strict';

const debug = require('debug')('gfke-support:services:dwh-api');
const join = require('join-path');
const requestPromise = require('request-promise');
const _ = require('lodash');

const requestRecorder = require('./requestRecorder');

const defaultOptions = {
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
        target: process.cwd()+"/dwhapi"
    },

    paths: {

    }
};

module.exports = class DwhApiService {
    /**
     * @param {object} options
     */
    constructor(options) {
        this._options = _.merge({}, defaultOptions, options);
        this.debug = debug;

        this.debug('setup dwh api');
        this.debug('setup dwh api url: %s', this._options.url);
        this.debug('setup dwh api options: %j', this._options);

        this._methods = {};
        this.setupDwhApiMethods();
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

    setupDwhApiMethods() {
        _.forEach(this._options.paths, (methods, action) => {
            const actionKey = _.upperFirst(_.camelCase(action));
            methods.forEach( m => {
                const mr = m.split(".").join("_").replace("/", "_");
                const methodKey = _.upperFirst(_.camelCase(mr));
                const queryMethod = `query${actionKey}${methodKey}`;

                this.debug('setup %s for %s', queryMethod, m);
                this[queryMethod] = (token, data, suffix, transformFn, transformErr) => {
                    return this.query(token, data, action, m, suffix, transformFn, transformErr);
                };
                this._methods[m] = this[queryMethod];
            });
        });
    }

    get options() {
        return this._options;
    }

    get url() {
        return this._options.url;
    }

    get domain() {
        return this._options.domain;
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

    get methods() {
        return this._methods;
    }

    methodForKey(key) {
        return this._methods[key];
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
    query(token, model, dataPath, dataSource, suffix, transformFn, transformErr) {
        if (dataPath == null) {
            dataPath = '';
        }

        if (transformFn == null) {
            transformFn = this.defaultTransformFn;
        }

        if (transformErr == null) {
            transformErr = this.defaultTransformErr;
        }

        const uri = join(this.url, this.domain, dataPath, dataSource, suffix);
        this.debug("Run Dwh Api Query for uri: %s", uri);
        this.debug("Model: %j", model);
        this.debug("Token: " + token);

        const requestOptions = this.options.requestOptions;
        requestOptions.uri = uri;
        requestOptions.json = model|| {};
        requestOptions.headers[this.options.tokenHeader] = token;
        requestOptions.transform = (data) => {
            this.debug("Got Response from " + uri);
            this.debug(data);

            if(this.options.requestRecorder.active) {
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

        return requestPromise(requestOptions).catch((err) => {
            if (err.statusCode === 500) {
                err.message = _.isUndefined(err.error) ? 'No error provided by DwhApi' : err.error.error;
            }
            err.requestOptions = requestOptions;

            try {
                transformErr.call(null, err, requestOptions, this.options);
            } catch (e) {
                throw e;
            } finally {
                throw err;
            }
        });
    }

    transform(data, transformers) {
        const originalData = _.cloneDeep(data);
        transformers.forEach(transformer => transformer(data, originalData));
        return data;
    }
};
