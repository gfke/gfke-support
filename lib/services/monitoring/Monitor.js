'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _osUtils = require('os-utils');

var _osUtils2 = _interopRequireDefault(_osUtils);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Provides system and ad-hoc monitoring
 */
class Monitor {
    /**
     *
     * @param {object} strategy The currently used monitoring strategy
     */
    constructor(strategy) {
        this.strategy = strategy;
    }

    /**
     * Starts the system watcher interval
     *
     * @param {Number} interval Interval in milliseconds
     */
    startSystemWatcher(interval) {
        this.interval = interval;
        this.stopSystemWatcher();
        this._intervalId = setInterval(this.writeSystemMetrics.bind(this), this.interval);
    }

    /**
     * Stops the system watcher interval
     */
    stopSystemWatcher() {
        clearInterval(this._intervalId);
    }

    /**
     * Adds a value to a specific metric.
     *
     * @param {string} prefix
     * @param {string} key
     * @param {*} value
     */
    add(prefix, key, value) {
        this.strategy.add(prefix + '.' + key, value);
    }

    /**
     * Sets a value to a specific metric
     *
     * @param {string} prefix
     * @param {string} key
     * @param {*} value
     */
    put(prefix, key, value) {
        this.strategy.put(prefix + '.' + key, value);
    }

    /**
     * Sets the collected system and process metrics
     */
    writeSystemMetrics() {
        (0, _co2.default)(function* () {
            _lodash2.default.forOwn((yield this.collectSystemMetrics()), (value, key) => this.put('system', key, value));
            _lodash2.default.forOwn(this.collectProcessMetrics(), (value, key) => this.put('process', key, value));
        }.call(this));
    }

    /**
     * Collects system specific metrics
     */
    collectSystemMetrics() {
        return (0, _co2.default)(function* () {
            return {
                cpu_usage: yield this.getCpuUsage(),
                mem_free: _osUtils2.default.freemem(),
                mem_total: _osUtils2.default.totalmem(),
                uptime_system: _osUtils2.default.sysUptime(),
                uptime_process: _osUtils2.default.processUptime(),
                loadavg1: _osUtils2.default.loadavg(1),
                loadavg5: _osUtils2.default.loadavg(5),
                loadavg15: _osUtils2.default.loadavg(15)
            };
        }.call(this));
    }

    /**
     * Collects process specific metrics
     */
    collectProcessMetrics() {
        const processMemoryUsage = process.memoryUsage();

        return {
            mem_rss: processMemoryUsage.rss,
            mem_heapTotal: processMemoryUsage.heapTotal,
            mem_heapUsed: processMemoryUsage.heapUsed
        };
    }

    /**
     * Returns the cpu usage
     *
     * @returns {Promise}
     */
    getCpuUsage() {
        return new Promise(resolve => {
            _osUtils2.default.cpuUsage(value => {
                resolve(value);
            });
        });
    }
}
exports.default = Monitor;