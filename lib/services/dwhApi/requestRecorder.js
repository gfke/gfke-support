'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (key, model, result) {
    if (_lodash2.default.isUndefined(process.env.DWHAPI_REQUEST_RECORD)) {
        return;
    }
    if (_lodash2.default.isString(process.env.DWHAPI_REQUEST_RECORD) === false) {
        process.env.DWHAPI_REQUEST_RECORD = _path2.default.resolve(process.cwd(), 'dwhapi_request_recorder');
    }
    const rrDirPath = process.env.DWHAPI_REQUEST_RECORD;

    if (_fs2.default.existsSync(rrDirPath) === false) {
        _fs2.default.mkdirSync(rrDirPath);
    }

    if ((_lodash2.default.isUndefined(model.startDate) || _lodash2.default.isUndefined(model.endDate)) === false) {
        key = (0, _joinPath2.default)(model.startDate, "_", model.endDate, "_", key);
        logger.info(`Key for Period: ${ key }`);
    }

    if ((_lodash2.default.isUndefined(model.start) || _lodash2.default.isUndefined(model.end)) === false) {
        key = (0, _joinPath2.default)(model.start, "_", model.end, "_", key);
        logger.info(`Key for Period: ${ key }`);
    }

    const reformattedKey = reformat(key),
          target = _path2.default.resolve(rrDirPath, `${ reformattedKey }.json`);

    logger.info(`Write for key: ${ reformattedKey }`);
    logger.info(`Write to: ${ target }`);
    logger.info(`Result: ${ result }`);

    _fs2.default.writeFileSync(target, JSON.stringify(result, null, '  '));
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _joinPath = require('join-path');

var _joinPath2 = _interopRequireDefault(_joinPath);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _utils2.default.logger();

function reformat(key) {
    key = key.replace('/', '.');
    return _lodash2.default.snakeCase(key);
}
/**
 * If EnvVar DWHAPI_REQUEST_RECORD got the value 1 (exactly)
 * it will write down the result to an file.
 * Filename will be built from key and model properties.
 *
 * e.g. {model.startDate}_{model.endDate}_{key}.json
 */