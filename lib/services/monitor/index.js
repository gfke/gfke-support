'use strict';

const _ = require('lodash');

const Monitor = require('./monitor');
const NoopMonitorStrategy = require('./noop-monitor-strategy');
const GraphiteMonitorStrategy = require('./graphite-monitor-strategy');


exports = module.exports = function(strategy, opts) {
    if(opts == null) {
        opts = {};
    }
    
    if(_.isUndefined(strategy)) {
        return new Monitor(new NoopMonitorStrategy());
    }
    
    let monitorStrategy = null;
    
    if(_.isUndefined(strategy)) {
        monitorStrategy = new NoopMonitorStrategy();
    } else if(_.isString(strategy)) {
        switch(strategy) {
            case 'noop':
                monitorStrategy = new NoopMonitorStrategy();
                break;
            case 'graphite':
                monitorStrategy = new GraphiteMonitorStrategy(opts);
                break;
        }
    } else {
        monitorStrategy = strategy;
    }

    return new Monitor(monitorStrategy);
};

exports.Monitor = Monitor;
exports.NoopMonitorStrategy = NoopMonitorStrategy;
exports.GraphiteMonitorStrategy = GraphiteMonitorStrategy;
