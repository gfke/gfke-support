'use strict';

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import join from 'join-path';

import utils from '../../utils';

const logger = utils.logger();

function reformat(key) {
    key = key.replace('/', '.');
    return _.snakeCase(key);
}
/**
 * If EnvVar DWHAPI_REQUEST_RECORD got the value 1 (exactly)
 * it will write down the result to an file.
 * Filename will be built from key and model properties.
 *
 * e.g. {model.startDate}_{model.endDate}_{key}.json
 */
export default function (key, model, result) {
    if(_.isUndefined(process.env.DWHAPI_REQUEST_RECORD)) {
        return;
    }
    if(_.isString(process.env.DWHAPI_REQUEST_RECORD) === false) {
        process.env.DWHAPI_REQUEST_RECORD = path.resolve(process.cwd(), 'dwhapi_request_recorder');
    }
    const rrDirPath = process.env.DWHAPI_REQUEST_RECORD;

    if (fs.existsSync(rrDirPath) === false){
        fs.mkdirSync(rrDirPath);
    }

    if((_.isUndefined(model.startDate) || _.isUndefined(model.endDate)) === false) {
        key = join(model.startDate, "_", model.endDate, "_", key);
        logger.info(`Key for Period: ${key}`);
    }

    if((_.isUndefined(model.start) || _.isUndefined(model.end)) === false) {
        key = join(model.start, "_", model.end, "_", key);
        logger.info(`Key for Period: ${key}`);
    }

    const reformattedKey = reformat(key),
          target = path.resolve(rrDirPath, `${reformattedKey}.json`);

    logger.info(`Write for key: ${reformattedKey}`);
    logger.info(`Write to: ${target}`);
    logger.info(`Result: ${result}`);

    fs.writeFileSync(target, JSON.stringify(result, null, '  '));
}
