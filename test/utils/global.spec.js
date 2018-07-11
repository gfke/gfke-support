'use strict';

describe('Util: global', function () {
  describe('Method expose', function () {
    it('should expose to global context', function() {
      var object = {
        info: "test"
      };
      this.lib.utils.global.expose(object, "TestInfoObject");
      should(global).have.property("TestInfoObject");
      global.TestInfoObject.should.be.eql(object);
    });

    it('should not expose to global context if key already exists', function() {
      var object = {
        info: "test"
      };

      var anotherObject = {
        info: "test2"
      };

      this.lib.utils.global.expose(object, "TestInfoObject");
      this.lib.utils.global.expose(anotherObject, "TestInfoObject");

      global.TestInfoObject.should.not.be.eql(anotherObject);
    });

    it('should force expose object to gobal context', function() {
      var object = {
        info: "test"
      };

      var anotherObject = {
        info: "test2"
      };

      this.lib.utils.global.expose(object, "TestInfoObject");
      this.lib.utils.global.expose(anotherObject, "TestInfoObject", true);

      global.TestInfoObject.should.be.eql(anotherObject);
    });
  });

  describe('Method exposeMany', function () {
    it('should expose all properties of the given object to global context', function() {
      var object = {
        exampleInfo: "test",
        anotherExampleInfo: "anotherTest"
      };

      this.lib.utils.global.exposeMany(object);
      should(global).have.property("exampleInfo");
      should(global).have.property("anotherExampleInfo");

      global.exampleInfo.should.be.eql("test");
      global.anotherExampleInfo.should.be.eql("anotherTest");
    });

    it('should expose all properties of the given object to global context with formatted key', function() {
      var object = {
        exampleInfo: "test",
        anotherExampleInfo: "anotherTest"
      };

      this.lib.utils.global.exposeMany(object, function(key) {
        return key+"Test";
      });
      should(global).have.property("exampleInfoTest");
      should(global).have.property("anotherExampleInfoTest");

      global.exampleInfoTest.should.be.eql("test");
      global.anotherExampleInfoTest.should.be.eql("anotherTest");
    });
  });
});
