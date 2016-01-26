'use strict';

const _ = require('lodash');
const PassThrough = require('stream').PassThrough;
const bunyan = require('bunyan');
const raven = require('raven');
const RavenStream = require('bunyan-raven');
const PrettyStream = require('bunyan-prettystream');

const logOptions = {name: 'middleware', level: 'debug'};

if (process.env.NODE_ENV === 'test' && _.isUndefined(process.env.silence_logger)) {
    const stream = new PrettyStream();
    stream.pipe(process.stdout);
    logOptions.level = 'error';
    logOptions.stream = stream;
} else if (process.env.NODE_ENV === 'development') {
    //Pretty print bunyan console output
    const stream = new PrettyStream();
    stream.pipe(process.stdout);
    logOptions.stream = stream;
} else {
    //Init raven client
    const ravenClient = new raven.Client(process.env.ravenDsn);
    //Let raven catch any runtime exception
    ravenClient.patchGlobal();
    logOptions.streams = [
        {
            type: 'raw',
            stream: new RavenStream(ravenClient),
            level: process.env.logLevel || 'warn'
        }
    ];
}

module.exports = bunyan.createLogger(logOptions);
