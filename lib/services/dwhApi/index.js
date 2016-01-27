'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _DwhApiFacade = require('./DwhApiFacade.js');

var _DwhApiFacade2 = _interopRequireDefault(_DwhApiFacade);

var _requestRecorder = require('./requestRecorder.js');

var _requestRecorder2 = _interopRequireDefault(_requestRecorder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    DwhApiFacade: _DwhApiFacade2.default,
    requestRecorder: _requestRecorder2.default
};