'use strict';

import osUtils from 'os-utils';
import co from 'co';
import _ from 'lodash';

/**
 * Provides system and ad-hoc monitoring
 */
export default class Monitor {
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
        co(function* () {
            _.forOwn(yield this.collectSystemMetrics(), (value, key) => this.put('system', key, value));
            _.forOwn(this.collectProcessMetrics(), (value, key) => this.put('process', key, value));
        }.call(this));
    }

    /**
     * Collects system specific metrics
     */
    collectSystemMetrics() {
        return co(function*() {
            return {
                cpu_usage:      yield this.getCpuUsage(),
                mem_free:       osUtils.freemem(),
                mem_total:      osUtils.totalmem(),
                uptime_system:  osUtils.sysUptime(),
                uptime_process: osUtils.processUptime(),
                loadavg1:       osUtils.loadavg(1),
                loadavg5:       osUtils.loadavg(5),
                loadavg15:      osUtils.loadavg(15)
            };
        }.call(this));
    }

    /**
     * Collects process specific metrics
     */
    collectProcessMetrics() {
        const processMemoryUsage = process.memoryUsage();

        return {
            mem_rss:       processMemoryUsage.rss,
            mem_heapTotal: processMemoryUsage.heapTotal,
            mem_heapUsed:  processMemoryUsage.heapUsed
        };
    }

    /**
     * Returns the cpu usage
     *
     * @returns {Promise}
     */
    getCpuUsage() {
        return new Promise((resolve) => {
            osUtils.cpuUsage((value) => { resolve(value); });
        });
    }
}
