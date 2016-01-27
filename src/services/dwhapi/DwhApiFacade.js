'use strict';

import join from 'join-path';
import requestPromise from 'request-promise';
import HttpError from 'http-errors';
import _ from 'lodash';

import requestRecorder from './requestRecorder.js';

const urmTokenHeader = 'x-mx-reqtoken';

export default class DwhApiFacade {
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
    extractDataAndTotalsFromResponse([{data:[{y:data=[]}=[]]=[], start:startDate, end:endDate, period:periodUnit, totals:totals, count:count}=[]]=[], onlyFirstData = false) {
        return {
            data: (onlyFirstData ? _.first(data) : data),
            totals,
            count,
            startDate,
            endDate,
            periodUnit: (_.isString(periodUnit) ? periodUnit.replace(/.{0,1}([d|w|m|q|y])/, '$1') : undefined)
        };
    }

    extractDataFromResponse([{data:[{y:[data]}]}]) {
        return data;
    }

    extractMatrixFromResponse([{data: data = [], start: startDate, end: endDate, period: periodUnit} = []]) {
        return {
            x: data.map(({x}) => x),
            y: _.last(data).y.map(({id, name}) => {
                return {id, name}
            }),
            data: data,
            startDate,
            endDate,
            periodUnit: (_.isString(periodUnit) ? periodUnit.replace(/.{0,1}([d|w|m|q|y])/, '$1') : undefined)
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
    extractCompareResponses([mainPeriodResponse, ...comparePeriodsResponses]) {
        return {
            mainPeriodResponse,
            comparePeriodsResponses
        }
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
    query(dataSource, model, suffix, dataPath = '', extractFunction = undefined) {
        const uri = join(this.dwhApiBaseUrl, this.dwhDomain, dataPath, dataSource, suffix);

        return requestPromise({
            uri,
            method: 'POST',
            json: model || {},
            gzip: true,
            headers: {
                [urmTokenHeader]: this.token
            },
            transform: (data) => {
                // request recorder to record dwhapi callbacks
                requestRecorder(join(dataPath, dataSource, suffix), model, data);

                if(_.isUndefined(extractFunction)){
                    return data;
                }

                try {
                    return extractFunction.call(null, data);
                } catch (e) {
                    throw new Error(`Error while transforming data. \nError ${e.message} \nData${data}`);
                }
            }
        }).catch((err) => {
            if (_.isUndefined(err.statusCode) === false) {
                //Wrap dwhApi error in HttpError to proxy the status code to the client
                if (err.statusCode === 500) {
                    //If dwhApi sent statusCode 500 extract error message from body
                    const message = _.isUndefined(err.error) ? 'No error provided by DwhApi' : err.error.error;
                    throw new HttpError(message, err.statusCode, {uri, model});
                }
                throw new HttpError(err.message, err.statusCode, {uri, model});
            }
            throw new Error(err.message, {uri, model});
        });
    }
}
