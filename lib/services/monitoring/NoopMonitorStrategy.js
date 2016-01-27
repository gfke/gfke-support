'use strict';

/**
 * Noop monitoring strategy, kept for debugging/development reasons
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
class NoopMonitorStrategy {
  put() {}

  add() {}
}
exports.default = NoopMonitorStrategy;