'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    let opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return _bunyan2.default.createLogger(_lodash2.default.merge({}, logOptions, opts));
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stream = require('stream');

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _raven = require('raven');

var _raven2 = _interopRequireDefault(_raven);

var _bunyanRaven = require('bunyan-raven');

var _bunyanRaven2 = _interopRequireDefault(_bunyanRaven);

var _bunyanPrettystream = require('bunyan-prettystream');

var _bunyanPrettystream2 = _interopRequireDefault(_bunyanPrettystream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logOptions = { name: 'middleware', level: 'debug' };

if (process.env.NODE_ENV === 'test' && _lodash2.default.isUndefined(process.env.silence_logger)) {
    const stream = new _bunyanPrettystream2.default();
    stream.pipe(process.stdout);
    logOptions.level = 'error';
    logOptions.stream = stream;
} else if (process.env.NODE_ENV === 'development') {
    //Pretty print bunyan console output
    const stream = new _bunyanPrettystream2.default();
    stream.pipe(process.stdout);
    logOptions.stream = stream;
} else {
    //Init raven client
    const ravenClient = new _raven2.default.Client(process.env.ravenDsn);
    //Let raven catch any runtime exception
    ravenClient.patchGlobal();
    logOptions.streams = [{
        type: 'raw',
        stream: new _bunyanRaven2.default(ravenClient),
        level: process.env.logLevel || 'warn'
    }];
}

;