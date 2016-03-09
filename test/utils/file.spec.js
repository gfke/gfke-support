'use strict';

describe('Util: file', function () {
  describe('Method checkPath', function () {
    it('should return true for __dirname', function(){
      this.lib.utils.file.checkPath(__dirname).should.be.ok;
    });
    it('should return false for not existing path', function(){
      this.lib.utils.file.checkPath("/not-existing-path").should.not.be.ok;
    });
  });

  describe('Method findInPath', function () {
    it('should return an object with files for __dirname', function() {
      var files = this.lib.utils.file.findInPath(__dirname);
      files.should.have.property(__filename);
    });
    it('should return an empty object for not existing path', function() {
      var files = this.lib.utils.file.findInPath("/not-existing-path");
      files.should.be.an.Object;
      Object.keys(files).length.should.be.eql(0);
    });
  });

  describe('Method read', function () {
    it('should return content of __filename');
    it('should return false for not existing filepath');
  });

  describe('Method write', function () {
    it('should write given content to target path');
  });

  describe('Method isDirectory', function () {
    it('should return true for __dirname', function() {
      this.lib.utils.file.isDirectory(__dirname).should.be.ok;
    });
    it('should return false for __filename', function() {
      this.lib.utils.file.isDirectory(__filename).should.not.be.ok;
    });
  });

  describe('Method loadAndMerge', function () {
    it('should load and merge all files in dummies folder', function() {
      var dummies = this.lib.utils.file.loadAndMerge(__dirname+"/dummies");
      dummies.should.have.property("one");
      dummies.should.have.property("two");
      dummies.one.should.be.eql(1);
      dummies.two.should.be.eql(2);
    });
    it('should load and merge all files on file basename in dummies folder', function() {
      var dummies = this.lib.utils.file.loadAndMerge(__dirname+"/dummies", {
        onFileBasename: true
      });
      dummies.should.have.property("dummyOne");
      dummies.should.have.property("dummyTwo");
      dummies.dummyOne.should.have.property("one");
      dummies.dummyTwo.should.have.property("two");
      dummies.dummyOne.one.should.be.eql(1);
      dummies.dummyTwo.two.should.be.eql(2);
    });
  });
});
