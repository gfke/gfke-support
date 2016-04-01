'use strict';

const debug = require("debug")("gfke-support:middlewares:error");

module.exports = function* error(next) {
    try {
        yield next;
        if (this.response.status === 404 && !this.response.body) {
            this.response.status = 404;
            if(this.log) {
                this.log.info('404 - Route not found. %s', this.url);
            }
            
            debug('404 - Route not found. %s', this.url);
        }
    } catch (err) {
        this.response.status = err.status || err.statusCode || 500;
        if(this.log) {
            this.log.error(
                "Name:",err.name,
                "\nMessage:", err.message,
                "\nError:", JSON.stringify(err, null, 2),
                "\nStack:", err.stack
            );
        }
        
        debug("Name: %s", err.name);
        debug("Message: %s", err.message);
        debug("Error: %j", err);
        debug("Stack: %s", err.stack);

        this.response.body = {
            message: err.error ? err.error.message : err.message,
            error: this.app.env !== 'production'? err : {},
            stack: this.app.env !== 'production'? err.stack.split("\n") : []
        };
    }
};
