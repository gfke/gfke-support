'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _dwhapi = require('./dwhapi/dwhapi.js');

var _dwhapi2 = _interopRequireDefault(_dwhapi);

var _urm = require('./urm/urm.js');

var _urm2 = _interopRequireDefault(_urm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Services = {
    DwhApi: _dwhapi2.default,
    Urm: _urm2.default
};

exports.default = Services;