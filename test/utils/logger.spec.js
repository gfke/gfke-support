'use strict';

describe("GFKE Support utils", function() {
    context("logger", function() {
        const logger = global.lib.utils.logger;
        
        it("should be a bunyan logger", function() {
            logger.should.be.an.Object;

            logger.should.have.a.property('streams');
            logger.should.have.a.property('_level');

            logger.should.have.a.property('trace');
            logger.trace.should.be.a.Function;

            logger.should.have.a.property('debug');
            logger.debug.should.be.a.Function;

            logger.should.have.a.property('info');
            logger.info.should.be.a.Function;

            logger.should.have.a.property('warn');
            logger.warn.should.be.a.Function;

            logger.should.have.a.property('error');
            logger.error.should.be.a.Function;

            logger.should.have.a.property('fatal');
            logger.fatal.should.be.a.Function;
        });
    });
});
