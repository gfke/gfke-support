'use strict';

const _ = require('lodash');

const log = require("debug")("gfke-support:utils:lodash");

exports._ = _;

function customizer(objValue, srcValue) {
    return _.isUndefined(objValue) ? srcValue : objValue;
}

exports.defaultAssign = _.partialRight(_.assignWith, customizer);
