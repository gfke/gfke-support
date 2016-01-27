'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function* (next) {
    yield next;

    if (_lodash2.default.isFunction(this.runAfter)) {
        (0, _co2.default)(this.runAfter).catch(err => {
            Logger.error('Error on executing runAfter:', err.message, err.stack);
        });
    }
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Logger = _utils2.default.logger();

/**
 * This middle ware enables execution of arbitrary code
 * after the response has already been sent to the client
 * Assign function to *runAfter* variable on koa's context
 * Do not forget to assign *this* with *bind* if needed in the function
 * @example
 *  productRouter.post('/ranking', function* () {
 *      const controller = new ProductController(this.request.body, this.token);
 *      this.response.body = yield controller.getPagedRanking();
 *      this.runAfter = controller.preloadNextPage.bind(controller);
 *  });
 * @param {Generator} next
 */
;