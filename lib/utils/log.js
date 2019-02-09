'use strict';


const _ = require('lodash');
const util = require('util');
const pino = require('pino');
const raven = require('raven');
const debug = require("debug")("gfke-support:utils:log");
const Writable = require('stream').Writable;

function RavenStream(raven) {
    this.raven = raven;
    this.level = {
        '10': 'trace',
        '20': 'debug',
        '30': 'info',
        '40': 'warning',
        '50': 'error',
        '60': 'fatal'
    }

    Writable.call(this, {
        objectMode: true,
        write(record, encoding, next) {
            record = JSON.parse(record);
            record.level = this.level[record.level.toString()];

            const options = {
                level: record.level,
                tags: _.pick(record, ['name', 'hostname', 'pid']),
                extra: _.omit(record, ['msg', 'time', 'v', 'err', 'level', 'name', 'hostname', 'pid'])
            }

            if (!record.err) {
                this.raven.captureMessage(record.msg, options);
                return next();
            }
            
            _.assign(record.err, {message: `${record.msg} (${record.err.message})`});

            this.raven.captureException(record.err.message, options);
            return next();
        }
    })
}

util.inherits(RavenStream, Writable);

exports.simpleLogger = function (opts) {
    opts = _.defaultsDeep(opts, {
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

        return pino(opts.pino, new RavenStream(raven));
    }

    if (process.env.NODE_ENV === 'test') {
        opts.pino.level = _.isUndefined(process.env.silence_logger) ? 'error' : 'fatal';
    }

    debug("Setup default logger");
    return pino(opts.pino);
};

// for testing purpose only
exports.RavenStream = RavenStream;
