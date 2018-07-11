'use strict';

describe('Util: log', function () {
  describe('Method simpleLogger', function () {
    it('should instatiate pino with a stdout stream without options', function() {
      var logger = this.lib.utils.log.simpleLogger();
      logger.stream.should.be.a.instanceOf(process.stdout.constructor);
    });
    it('should instatiate pino with a raven stream when activated', function() {
      var opts = {
        raven: {
          active: true,
          ravenDsn: 'https://username:password@example.com/1'
        }
      }
      var logger = this.lib.utils.log.simpleLogger(opts);
      logger.stream.should.be.a.instanceOf(this.lib.utils.log.RavenStream);
    });
    it('should instatiate pino with custom log level', function() {
      var opts = {
        pino: {
          level: 'warn'
        }
      }
      var logger = this.lib.utils.log.simpleLogger(opts);
      logger._levelVal.should.equal(40)
    });
    it('should instatiate pino with bunyan opts', function() {
      var opts = {
        bunyan: {
          level: 'error'
        }
      }
      var logger = this.lib.utils.log.simpleLogger(opts);
      logger._levelVal.should.equal(50)
    });
  });
});
