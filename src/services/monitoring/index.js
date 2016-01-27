'use strict';

import _ from 'lodash';
import Monitor from './Monitor.js';
import NoopMonitorStrategy from './NoopMonitorStrategy.js';
import GraphiteMonitorStrategy from './GraphiteMonitorStrategy.js';

export {
    Monitor,
    NoopMonitorStrategy,
    GraphiteMonitorStrategy
};

let strategy;

if (process.env.NODE_ENV === 'development') {
    strategy = new NoopMonitorStrategy();
} else {
    strategy = new GraphiteMonitorStrategy();
}

export default function(customStrategy) {
    if(_.isUndefined(customStrategy)) {
        return new Monitor(strategy);
    }

    return new Monitor(customStrategy);
}
