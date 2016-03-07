'use strict';

const _ = require('lodash');
const co = require('co');

/**
 * This middle ware enables execution of arbitrary code
 * after the response has already been sent to the client
 * Assign function to *runAfter* variable on koa's context
 * Do not forget to assign *this* with *bind* if needed in the function
 * @example
 *  router.post('/example', function* () {
 *      const controller = new Controller(this.request.body.fields, this.token);
 *      this.response.body = yield controller.getPagedExample();
 *      this.runAfter = controller.preloadNextPage.bind(controller);
 *  });
 * @param {Generator} next
 */
module.exports = function* runAfter(next) {
    yield next;
    const ctx = this;
    if (_.isFunction(ctx.runAfter)) {
        co(this.runAfter).catch(function(err) {
            ctx.log.error('Error on executing runAfter:', err.message, err.stack);
        });
    }
};
