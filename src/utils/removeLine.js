'use strict';

/**
 * Remove topmost line from text
 * @param {string} text
 * @returns {string}
 */
export default function removeLine(text) {
    return text.substring(text.indexOf('\n') + 1);
}
