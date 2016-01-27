'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (app) {
    app.use((0, _koaBunyanLogger2.default)(Logger));

    app.use(_koaBunyanLogger2.default.requestLogger({
        //Add token to each logged request
        updateLogFields: function updateLogFields(fields) {
            fields.token = this.request.headers['x-mx-reqtoken'];
            //Remove the bloated response and request objects from the log entry
            delete fields.res;
            delete fields.req;
        },
        updateResponseLogFields: function updateResponseLogFields(fields) {
            if (process.env.NODE_ENV !== 'test') {
                //Just log detailed request data on error
                if (this.status >= 400) {
                    fields.headers = this.request.headers;
                    fields.body = this.request.body;
                }
            }
        }
    }));
};

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _koaBunyanLogger = require('koa-bunyan-logger');

var _koaBunyanLogger2 = _interopRequireDefault(_koaBunyanLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Logger = _utils2.default.logger();

exports.logger = (0, _koaBunyanLogger2.default)(Logger);
exports.requestLogger = _koaBunyanLogger2.default.requestLogger({
    //Add token to each logged request
    updateLogFields: function updateLogFields(fields) {
        fields.token = this.request.headers['x-mx-reqtoken'];
        //Remove the bloated response and request objects from the log entry
        delete fields.res;
        delete fields.req;
    },
    updateResponseLogFields: function updateResponseLogFields(fields) {
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