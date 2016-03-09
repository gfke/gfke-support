'use strict';

describe('Util: debug', function () {
    it('should return an debug logger', function() {
        var log = this.lib.utils.debug("test");
        log.should.be.a.Function();
        log.namespace.should.be.eql("test");
    });
    it('should return an debug logger with method to create childLogger', function() {
        var subLog = this.lib.utils.debug("test").childLogger("sub");
        subLog.should.be.a.Function();
        subLog.namespace.should.be.eql("test:sub");
    });
});
