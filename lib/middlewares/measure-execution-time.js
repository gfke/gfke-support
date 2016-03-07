'use strict';

const debug = require("debug")("gfke-support:middlewares:measureExecutionTime");

/**
 * Put measure time of execution to current monitor.
 * @param next
 */
module.exports = function* measureExecutionTime(next) {
    const start = new Date;
    yield next;
    const end = new Date() - start;
    if(this.app.context.monitor) {
        this.app.context.monitor.put('koa', 'execution_time', end);
    } 
    
    if (this.log) {
        this.log.info('koa', 'execution_time', end);
    }
    
    debug("koa execution_time %s", end);
};
