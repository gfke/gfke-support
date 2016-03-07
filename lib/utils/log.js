'use strict';


const _ = require('lodash');
// const PassThrough = require('stream').PassThrough;
const bunyan = require('bunyan');
const raven = require('raven');
const RavenStream = require('bunyan-raven');
const PrettyStream = require('bunyan-prettystream');

const log = require("debug")("gfke-support:utils:log");

const lodashUtils = require('./lodash');

exports.simpleLogger = function (opts) {
    if (_.isUndefined(opts)) {
        opts = {};
        opts.bunyan = {};
    }

    const stream = new PrettyStream();
    stream.pipe(process.stdout);
    lodashUtils.defaultAssign(opts.bunyan, {
        name: 'middleware',
        level: 'debug',
        streams: [{
            level: opts.level,
            stream: stream
        }]
    });

    ////Pretty print bunyan console output
    //const stream = new PrettyStream();
    //stream.pipe(process.stdout);
    //logOptions.stream = stream;

    if (opts.raven.active !== false) {
        log("Setup Raven as Logger");
        //Init raven client
        const ravenClient = new raven.Client(opts.raven.ravenDsn);
        //Let raven catch any runtime exception
        ravenClient.patchGlobal();
        opts.bunyan.streams.push({
            type: 'raw',
            stream: new RavenStream(ravenClient),
            level: opts.raven.ravenLogLevel
        });
    }

    if (process.env.NODE_ENV === 'test') {
        opts.bunyan.level = _.isUndefined(process.env.silence_logger) ? 'error' : 'fatal';
    }

    return bunyan.createLogger(opts.bunyan);
};
