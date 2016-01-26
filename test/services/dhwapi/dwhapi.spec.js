'use strict';

describe("GFKE Support services", function() {
    context("dwhApi", function() {
        it('not implemented yet');
    });
});


// import nock from 'nock';
//
// const {DwhApi} = global.Lib.Services;
//
// describe('Services: DwhApi', function() {
//
//     afterEach(function() {
//           nock.cleanAll();
//     });
//
//     context('Facade Class', function() {
//         it('should be a class', function() {
//             DwhApi.should.be.a.Function;
//         });
//     });
//
//     context('Request', function() {
//         const dwhApi = new DwhApi('xxx');
//
//         before(function() {
//             nock('https://www.gfk-e.com')
//                 .post('/staging-dwhapi/bookdach/data/test', () => true)
//                 .reply(200, {data: 'ok'});
//         });
//
//         it('should response {data: "ok"}', function*() {
//             const res = yield dwhApi.query('data', {}, 'test');
//             res.data.should.be.eql('ok');
//         });
//     });
// });
