'use strict';

import _ from 'lodash';
import socketClient from 'socket.io-client';
import logger from './logger.js';
import removeLine from './removeLine.js'

/**
 * Error used to signal that some error happened during a Socket event
 * StatusCode should be set to return a correct HTTP code
 */
export class SocketError extends Error {
    /**
     * @param {string} message Exception text
     * @param {number} statusCode HTTP Error code that fits the occured error
     * @param {string} previousStack Stack from previous frame
     */
    constructor(message, statusCode, previousStack) {
        super(message);
        this.status = statusCode;

        //Remove the first two line from both stacks as
        //they would only be the line where the error was created
        //and a superfluous error message
        previousStack = removeLine(previousStack);
        previousStack = removeLine(previousStack);
        this.stack = removeLine(this.stack);
        this.stack = removeLine(this.stack);

        //Combine both stacks to provide all available information
        this.stack = `\n${this.stack}\nFrom previous event:\n${previousStack}`;
    }
}

export default function(url, opts={}) {
    /**
     * Create a Socket instance and connect it to the URM socket server
     */
    const _socket = socketClient(url, _.merge({
        transports: ['websocket'],
        reconnection: true,
        // Retry every 20 sec. Protects the log from beeing hammered with errors
        reconnectionDelay: 20000
    }, opts));

    _socket.on('connect', () => {
        log.info('Socket: Connection established');
    });

    _socket.on('connect_error', (error) => {
        //Log silent. Throwing an error would terminate the process instead of trying to reconnect
        logger.error('Socket: An error occurred while connecting to %s. %s', process.env.urmSocketUrl, error, error.stack);
    });

    return _socket;
}
