'use strict';

// ex
import _ from 'lodash';
import nock from 'nock';
import mockery from 'mockery';

// lib
import lib from '..';

// If there is something wrong with the compiled code e.g.
// if you compile while having syntax error
// log and exit the test code, as the watch mode would end
// up in an undefined state elsewise
if(_.isEmpty(process.listeners('uncaughtException'))) {
  process.on('uncaughtException', (err) => {
    console.error(`${new Date().toUTCString()} uncaughtException: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
}

//Disable all logging if --silent was provided
//else expected errors like 401 or 404 will flood the log on the CI build
if (_.contains(process.argv, '--silent')) {
      process.env.silence_logger = true;
}

//Disallow all external HTTP requests that are not mocked
nock.disableNetConnect();
//Allow all calls to the API
nock.enableNetConnect('127.0.0.1');

//Mock Socket Connection
mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
});

// Noop for SocketIO
function SocketIoClientMock() {
    let listener = {};

    return {
        on: (event, fn)=> {
            listener[event] = fn;
        },
        emit: (event)=> {
            process.nextTick(() => {
                listener[event]({status: true, message: 'mock'})
            });
        }
    };
}

//Mock Noop Setup
mockery.registerMock('socket.io-client', SocketIoClientMock);

// Expose lib globally
global.lib = lib;
