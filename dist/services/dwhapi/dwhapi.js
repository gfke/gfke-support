'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _joinPath = require('join-path');

var _joinPath2 = _interopRequireDefault(_joinPath);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('../../utils/logger.js');

var _logger2 = _interopRequireDefault(_logger);

var _requestRecorder = require('./requestRecorder.js');

var _requestRecorder2 = _interopRequireDefault(_requestRecorder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

const urmTokenHeader = 'x-mx-reqtoken';

class DwhApiFacade {
    constructor(token) {
        this.dwhApiBaseUrl = process.env.dwhApiBaseUrl;
        this.dwhDomain = process.env.dwhDomain;
        this.token = token;
    }

    //TODO: Let the facade return Response object, which provide these methods per instance?
    /**
     * Destructure the dwhApi response to get only the data object nested in the body
     * Each response contains two root objects, the first representing the actual data and the second the totals for this query
     * Each single destructuring step is guarded against undefined values with default values of empty arrays
     *
     * @param {object} data Actual data from the response
     * @param {object} totals Total that for this response
     * @param {string|undefined} start Start date of the period
     * @param {string|undefined} end End date of the period
     * @param {string|undefined} period Period mode containing the period unit (d, w, m, q, y)
     * @param {bool} onlyFirstData Flag defining if only the first element of the data array should be returned
     * @returns {{data: object|Array, totals}}
     */
    extractDataAndTotalsFromResponse() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var _ref2 = _slicedToArray(_ref, 1);

        var _ref2$ = _ref2[0];
        _ref2$ = _ref2$ === undefined ? [] : _ref2$;
        var _ref2$$data = _ref2$.data;
        _ref2$$data = _ref2$$data === undefined ? [] : _ref2$$data;

        var _ref2$$data2 = _slicedToArray(_ref2$$data, 1);

        var _ref2$$data2$ = _ref2$$data2[0];
        _ref2$$data2$ = _ref2$$data2$ === undefined ? [] : _ref2$$data2$;
        var _ref2$$data2$$y = _ref2$$data2$.y;
        let data = _ref2$$data2$$y === undefined ? [] : _ref2$$data2$$y;
        let startDate = _ref2$.start;
        let endDate = _ref2$.end;
        let periodUnit = _ref2$.period;
        let totals = _ref2$.totals;
        let count = _ref2$.count;
        let onlyFirstData = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return {
            data: onlyFirstData ? _lodash2.default.first(data) : data,
            totals,
            count,
            startDate,
            endDate,
            periodUnit: _lodash2.default.isString(periodUnit) ? periodUnit.replace(/.{0,1}([d|w|m|q|y])/, '$1') : undefined
        };
    }

    extractDataFromResponse(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1);

        var _ref4$0$data = _slicedToArray(_ref4[0].data, 1);

        var _ref4$0$data$0$y = _slicedToArray(_ref4$0$data[0].y, 1);

        let data = _ref4$0$data$0$y[0];

        return data;
    }

    extractMatrixFromResponse(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 1);

        var _ref6$ = _ref6[0];
        _ref6$ = _ref6$ === undefined ? [] : _ref6$;
        var _ref6$$data = _ref6$.data;
        let data = _ref6$$data === undefined ? [] : _ref6$$data;
        let startDate = _ref6$.start;
        let endDate = _ref6$.end;
        let periodUnit = _ref6$.period;

        return {
            x: data.map(_ref7 => {
                let x = _ref7.x;
                return x;
            }),
            y: _lodash2.default.last(data).y.map(_ref8 => {
                let id = _ref8.id;
                let name = _ref8.name;

                return { id, name };
            }),
            data: data,
            startDate,
            endDate,
            periodUnit: _lodash2.default.isString(periodUnit) ? periodUnit.replace(/.{0,1}([d|w|m|q|y])/, '$1') : undefined
        };
    }

    /**
     * Extract the main period from the response. All other periods in the response are compare periods
     * which are extracted in an array
     *
     * @param mainPeriodResponse
     * @param comparePeriodsResponses
     * @returns {{mainPeriodResponse: *, comparePeriodsResponses: *}}
     */
    extractCompareResponses(_ref9) {
        var _ref10 = _toArray(_ref9);

        let mainPeriodResponse = _ref10[0];

        let comparePeriodsResponses = _ref10.slice(1);

        return {
            mainPeriodResponse,
            comparePeriodsResponses
        };
    }

    /**
     * Performs a request against the DWH API and returns the response with a promise.
     * Passes the whole request body including request token from the submitted request object.
     * TODO: Replace long parameter list with object?
     *
     * @param {string} dataSource
     * @param {object} model The model holding the filter values
     * @param {string} suffix PeriodMode on data sources, FilterName on filter sources
     * @param {string} dataPath String to append to the dwhApi path
     * @param {Function|undefined} extractFunction Function to extract the wanted data from the response body
     * @returns {Promise}
     */
    query(dataSource, model, suffix) {
        let dataPath = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
        let extractFunction = arguments.length <= 4 || arguments[4] === undefined ? undefined : arguments[4];

        const uri = (0, _joinPath2.default)(this.dwhApiBaseUrl, this.dwhDomain, dataPath, dataSource, suffix);

        return (0, _requestPromise2.default)({
            uri,
            method: 'POST',
            json: model || {},
            gzip: true,
            headers: {
                [urmTokenHeader]: this.token
            },
            transform: data => {
                // request recorder to record dwhapi callbacks
                (0, _requestRecorder2.default)((0, _joinPath2.default)(dataPath, dataSource, suffix), model, data);

                if (_lodash2.default.isUndefined(extractFunction)) {
                    return data;
                }

                try {
                    return extractFunction.call(null, data);
                } catch (e) {
                    throw new Error(`Error while transforming data. \nError ${ e.message } \nData${ data }`);
                }
            }
        }).catch(err => {
            if (_lodash2.default.isUndefined(err.statusCode) === false) {
                //Wrap dwhApi error in HttpError to proxy the status code to the client
                if (err.statusCode === 500) {
                    //If dwhApi sent statusCode 500 extract error message from body
                    const message = _lodash2.default.isUndefined(err.error) ? 'No error provided by DwhApi' : err.error.error;
                    throw new _httpErrors2.default(message, err.statusCode, { uri, model });
                }
                throw new _httpErrors2.default(err.message, err.statusCode, { uri, model });
            }
            throw new Error(err.message, { uri, model });
        });
    }
}
exports.default = DwhApiFacade;