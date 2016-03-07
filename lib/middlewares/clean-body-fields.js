const _ = require('lodash');
module.exports = function * cleanBodyFields(next) {
    if(_.isUndefined(this.request.body) === false) {
        _.forEach(this.request.body.fields, (v, k) => {
            if(_.isNumber(v) === false) {
                if(_.isUndefined(v) || _.isEmpty(v)) {
                    this.log.info("Unset empty Body Fields:", k, ":", v);
                    _.unset(this.request.body.fields, k);
                }
            }
        });
    }
    yield next;
};
