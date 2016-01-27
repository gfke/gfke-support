'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseUrmFacade = require('./BaseUrmFacade.js');

var _BaseUrmFacade2 = _interopRequireDefault(_BaseUrmFacade);

var _AuthorizationFacade = require('./AuthorizationFacade.js');

var _AuthorizationFacade2 = _interopRequireDefault(_AuthorizationFacade);

var _UserSettingsFacade = require('./UserSettingsFacade.js');

var _UserSettingsFacade2 = _interopRequireDefault(_UserSettingsFacade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    BaseUrmFacade: _BaseUrmFacade2.default,
    AuthorizationFacade: _AuthorizationFacade2.default,
    UserSettingsFacade: _UserSettingsFacade2.default
};