'use strict';

import services from '../../services';

// FIXME: This is a really bad solution. Monitor should be part of app
const monitor = services.monitoring();

export default function*(next) {
    const start = new Date;

    yield next;

    monitor.put('koa', 'execution_time', new Date - start);
}
