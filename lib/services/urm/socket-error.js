'use strict';

const removeLine = require("../../utils/string").removeLine;

/**
 * Error used to signal that some error happened during a Socket event
 * StatusCode should be set to return a correct HTTP code
 */
module.exports = class SocketError extends Error {
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
};
