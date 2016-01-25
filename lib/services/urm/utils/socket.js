'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SocketError = undefined;

var _socket2 = require('socket.io-client');

var _socket3 = _interopRequireDefault(_socket2);

var _logger = require('../../../utils/logger.js');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Remove topmost line from text
 * @param {string} text
 * @returns {string}
 */
function removeLine(text) {
    return text.substring(text.indexOf('\n') + 1);
}

/**
 * Error used to signal that some error happened during a Socket event
 * StatusCode should be set to return a correct HTTP code
 */
class SocketError extends Error {
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
        this.stack = `\n${ this.stack }\nFrom previous event:\n${ previousStack }`;
    }
}

exports.SocketError = SocketError; /**
                                    * Create a Socket instance and connect it to the URM socket server
                                    */

const _socket = (0, _socket3.default)(process.env.urmSocketUrl, {
    transports: ['websocket'],
    reconnection: true,
    // Retry every 20 sec. Protects the log from beeing hammered with errors
    reconnectionDelay: 20000
});

_socket.on('connect', () => {
    _logger2.default.info('Socket: Connection established');
});

_socket.on('connect_error', error => {
    //Log silent. Throwing an error would terminate the process instead of trying to reconnect
    _logger2.default.error('Socket: An error occurred while connecting to %s. %s', process.env.urmSocketUrl, error, error.stack);
});

exports.default = _socket;