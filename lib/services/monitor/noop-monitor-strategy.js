'use strict';

/**
 * Noop monitoring strategy, kept for debugging/development reasons
 */
module.exports = class NoopMonitorStrategy {
    constructor (opts) {
        this.opts = opts;
    }
    
    put() {}

    add() {}
};
