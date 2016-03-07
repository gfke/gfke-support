'use strict';

const _ = require('lodash');
const intl = require('intl');
const moment = require('moment');

/**
 * Returns an Intl API for a specific locale.
 *
 * @todo Refactor and implement as fully fledged class
 * @param {object} acceptLanguage lang
 * @returns {{currency: intl.NumberFormat, quantity: intl.NumberFormat, datetime: intl.DateTimeFormat}}
 */
exports.getIntlApi = function (acceptLanguage) {
    let locale = 'de-DE';

    if (_.isUndefined(acceptLanguage) === false) {
        locale = _.first(acceptLanguage.split(','));
    }

    return {
        currency: new intl.NumberFormat(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
        quantity: new intl.NumberFormat(locale, {maximumFractionDigits: 0}),
        percent: new intl.NumberFormat(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'percent'}),
        period: {
            /**
             * Returns a formatted date string depending on the specified period (d, w, m, q, y)
             * Uses moment.js as the intl.DateTimeFormat formatting options are quite limited
             *
             * @todo Formatting strings should be provided by translation service
             * @param {string} periodUnit
             * @param {string} date
             * @returns {string}
             */
                formatDate(periodUnit, date) {
                moment.locale(locale);

                switch(periodUnit) {
                    default:
                    case 'd':
                        const api = new intl.DateTimeFormat(locale);
                        return api.format(date);
                    case 'w':
                        return moment.utc(date).format('[KW] WW GGGG');
                    case 'm':
                        return moment.utc(date).format('MMMM YYYY');
                    case 'q':
                        return moment.utc(date).format('[Q.]Q YYYY');
                    case 'y':
                        return moment.utc(date).format('YYYY');
                }
            },

            format(periodUnit, startDate, endDate) {
                if (_.isUndefined(periodUnit) === false &&
                    (_.isUndefined(startDate) === false || _.isUndefined(endDate) === false)) {
                    return this.formatDate(periodUnit, startDate) +
                        (startDate !== endDate ? ' - ' + this.formatDate(periodUnit, endDate) : '');
                }
            }
        }
    };
};
