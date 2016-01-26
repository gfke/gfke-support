'use strict';

const contains = require('lodash').contains;
const nock = require('nock');
const mockery = require('mockery');

before(function() {
    //Disable all logging if --silent was provided
    //else expected errors like 401 or 404 will flood the log on the CI build
    if (contains(process.argv, '--silent')) {
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
});
