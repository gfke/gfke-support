'use strict';

const _ = require('lodash');

describe('Util: lodash', function () {
    describe('Method defaultAssign', function () {
        it("should assign, but do not override default values", function () {
            var startObj = {
                user: 'test'
            };
            var mergeObj = {
                age: 18
            };
            var assignObj = {
                user: 'otherTest'
            };

            var resultObj = _.assign({}, startObj, mergeObj, assignObj);
            resultObj.should.be.eql({
                user: 'otherTest',
                age: 18
            });

            resultObj = this.lib.utils.lodash.defaultAssign({}, startObj, mergeObj, assignObj);
            resultObj.should.be.eql({
                user: 'test',
                age: 18
            });

        });
    });
});
