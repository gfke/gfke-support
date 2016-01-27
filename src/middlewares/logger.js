'use strict';

import utils from '../utils';
import BunyanMiddleware from 'koa-bunyan-logger';

const Logger = utils.logger();

exports.logger = BunyanMiddleware(Logger);
exports.requestLogger = BunyanMiddleware.requestLogger({
    //Add token to each logged request
    updateLogFields: function (fields) {
        fields.token = this.request.headers['x-mx-reqtoken'];
        //Remove the bloated response and request objects from the log entry
        delete fields.res;
        delete fields.req;
    },
    updateResponseLogFields: function (fields) {
        if (process.env.NODE_ENV !== 'test') {
            //Just log detailed request data on error
            if (this.status >= 400) {
                fields.headers = this.request.headers;
                fields.body = this.request.body;
            }
        }
    }
});

/**
 * Registers bunyan middleware
 *
 * @param {object} app Koa Application
 */
export default function (app) {
    app.use(BunyanMiddleware(Logger));

    app.use(BunyanMiddleware.requestLogger({
        //Add token to each logged request
        updateLogFields: function (fields) {
            fields.token = this.request.headers['x-mx-reqtoken'];
            //Remove the bloated response and request objects from the log entry
            delete fields.res;
            delete fields.req;
        },
        updateResponseLogFields: function (fields) {
            if (process.env.NODE_ENV !== 'test') {
                //Just log detailed request data on error
                if (this.status >= 400) {
                    fields.headers = this.request.headers;
                    fields.body = this.request.body;
                }
            }
        }
    }));
}
