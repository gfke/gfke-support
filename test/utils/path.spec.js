'use strict';

describe('Util: path', function () {
  describe('Method isAbsolute', function () {
    it('should return true for __dirname', function() {
      this.lib.utils.path.isAbsolute(__dirname).should.be.ok;
    });
    it('should return false for ..', function() {
      this.lib.utils.path.isAbsolute("..").should.not.be.ok;
    });
  });
});
