'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _graphiteUdp = require('graphite-udp');

var _graphiteUdp2 = _interopRequireDefault(_graphiteUdp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Concrete Graphite monitoring strategy
 */
class GraphiteMonitorStrategy {
    constructor() {
        this.metric = _graphiteUdp2.default.createClient({
            host: process.env.HOSTEDGRAPHITE_HOST,
            port: process.env.HOSTEDGRAPHITE_PORT,
            type: 'udp4',
            prefix: (process.env.HOSTEDGRAPHITE_APIKEY || '') + '.' + (process.env.NODE_ENV || 'development'),
            verbose: false,
            interval: 10000
        });
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
}
exports.default = GraphiteMonitorStrategy;