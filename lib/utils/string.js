'use strict';

/**
 * Remove topmost line from text
 * @param {string} text
 * @returns {string}
 */
exports.removeLine = function removeLine(text) {
    return text.substring(text.indexOf('\n') + 1);
};
