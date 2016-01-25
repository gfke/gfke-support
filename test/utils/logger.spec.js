'use strict';

const {Logger} = global.Lib.Utils;

describe("Utils: Logger", function() {
    it("should be a bunyan logger", function() {        
        Logger.should.be.an.Object;

        Logger.should.have.a.property('streams');
        Logger.should.have.a.property('_level');

        Logger.should.have.a.property('trace');
        Logger.trace.should.be.a.Function;

        Logger.should.have.a.property('debug');
        Logger.debug.should.be.a.Function;

        Logger.should.have.a.property('info');
        Logger.info.should.be.a.Function;

        Logger.should.have.a.property('warn');
        Logger.warn.should.be.a.Function;

        Logger.should.have.a.property('error');
        Logger.error.should.be.a.Function;

        Logger.should.have.a.property('fatal');
        Logger.fatal.should.be.a.Function;
    });
});
