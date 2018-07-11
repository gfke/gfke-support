'use strict';


const _ = require('lodash');
const pino = require('pino');
const raven = require('raven');
const debug = require("debug")("gfke-support:utils:log");

const mapRavenErrorLevel = [];
mapRavenErrorLevel[10] = 'trace';
mapRavenErrorLevel[20] = 'debug';
mapRavenErrorLevel[30] = 'info';
mapRavenErrorLevel[40] = 'warning';
mapRavenErrorLevel[50] = 'error';
mapRavenErrorLevel[60] = 'fatal';

const stream = new require('stream').Writable({
    objectMode: true,
    write(record, encoding, next) {
        record = JSON.parse(record);
        record.level = mapRavenErrorLevel[record.level];

        const options = {
            level: record.level,
            tags: _.pick(record, ['name', 'hostname', 'pid']),
            extra: _.omit(record, ['msg', 'time', 'v', 'err', 'level', 'name', 'hostname', 'pid'])
        }

        if (!record.err) {
            raven.captureMessage(record.msg, options);
            return next();
        }
        
        _.assign(record.err, {message: `${record.msg} (${record.err.message})`});

        raven.captureException(err, options);
        return next();
    },
});

exports.simpleLogger = function (opts) {
    _.defaultsDeep(opts, {
        raven: {
            active: false
        },
        pino: {}
    });
    
    // keep backwards compatibility
    _.defaultsDeep(opts.pino, opts.bunyan)

    if (opts.raven.active !== false) {
        debug("Setup Raven as logger");
        raven.config(opts.raven.ravenDsn).install();

        return pino(opts.pino, stream);
    }

    if (process.env.NODE_ENV === 'test') {
        opts.pino.level = _.isUndefined(process.env.silence_logger) ? 'error' : 'fatal';
    }

    debug("Setup default logger");
    return pino(opts.pino);
};
