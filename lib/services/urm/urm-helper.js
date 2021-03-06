'use strict';

const _ = require('lodash');

/**
 * 
 * @param {string} token
 * @params {object} any amount of objects which will be merged
 * @return {object}
 */
exports.setupUrmData = function(token) {
    let data = {};
    data.userToken = token;
    _.forEach(Array.prototype.slice.call(arguments, 1), function(arg) {
       _.merge(data, arg); 
    });
    
    return data;
};