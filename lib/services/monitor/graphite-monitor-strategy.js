'use strict';

const _ = require('lodash');
const graphite = require('graphite-udp');

const defaultOptions = {
    type: 'udp4',
    verbose: false,
    interval: 10000
};

/**
 * Concrete Graphite monitoring strategy
 */
module.exports = class GraphiteMonitorStrategy {
    constructor(opts) {
        this.opts = opts;
        this.metric = graphite.createClient(_.merge({}, defaultOptions, opts));
    }

    /**
     * Sets the value of a specific metric within the configured interval
     *
     * @param {string} key
     * @param {*} value
     */
    put(key, value) {
        this.metric.put(key, value);
    }

    /**
     * Adds a value to a specific metric within the configured interval
     *
     * @param {string} key
     * @param {*} value
     */
    add(key, value) {
        this.metric.add(key, value);
    }
};
