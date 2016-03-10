'use strict';

describe('Services: URM', function() {
    describe('Helper', function() {
        describe('setupUrmData', function() {
            it('should return a object', function(){
                const data = this.lib.services.urm.urmHelper.setupUrmData('test', {
                    one: 1
                }, {
                    two: 2
                });
                
                data.should.be.an.Object;
                data.should.have.a.property('userToken');
                data.should.have.a.property('one');
                data.should.have.a.property('two');
                
                data.userToken.should.be.eql('test');
                data.one.should.be.eql(1);
                data.two.should.be.eql(2);
            });
        });
    });
});