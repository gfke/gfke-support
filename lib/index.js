'use strict';

const path = require('path');

const middlewares = require(path.resolve(__dirname, 'middlewares'));
const services = require(path.resolve(__dirname, 'services'));
const utils = require(path.resolve(__dirname, 'utils'));

module.exports = {middlewares, services, utils};
