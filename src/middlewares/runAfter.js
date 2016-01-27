'use strict';

import _ from 'lodash';
import co from 'co';
import utils from '../utils';

const Logger = utils.logger();

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
export default function* (next) {
    yield next;

    if (_.isFunction(this.runAfter)) {
        co(this.runAfter).catch((err) => {
            Logger.error('Error on executing runAfter:', err.message, err.stack);
        });
    }
};
