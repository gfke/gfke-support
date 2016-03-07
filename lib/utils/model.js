'use strict';

const _ = require('lodash');

/**
 * Returns the keyword property only if its inner keyword property
 * is not an empty string or all whitespaces
 * Returns undefined else wise
 * Necessary as the API will throw an error if empty strings are sent
 * @param {object} keyword
 * @returns {string|undefined}
 */
exports.getNotEmptyKeywordOrUndefined = function (keyword) {
    const keywordValue = _.get(keyword, 'keyword');
    if (_.isUndefined(keywordValue) || _.isEmpty(_.trim(keywordValue))) {
        return;
    }
    return keyword;
};

exports.getPropertyIDs = function (property) {
    if (_.isUndefined(property) || _.isNull(property) || _.isEmpty(property)) {
        return [];
    }

    //If the values in the array are not object, it was already transformed.
    //So simply return it
    if (_.isObject(property[0]) === false ) {
        return property;
    }

    return _.map(property, 'ID');
};
