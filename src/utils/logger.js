'use strict';

import _ from 'lodash';
import {PassThrough} from 'stream';
import bunyan from 'bunyan';
import raven from 'raven';
import RavenStream from 'bunyan-raven';
import PrettyStream from 'bunyan-prettystream';

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

export default bunyan.createLogger(logOptions);
