'use strict';

/**
 * Remove topmost line from text
 * @param {string} text
 * @returns {string}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeLine;
function removeLine(text) {
  return text.substring(text.indexOf('\n') + 1);
}