'use strict';

describe("GFKE Support", function() {
    context("lib", function() {
        const lib = require('..');

        it("should have property middlewares", function() {
            lib.should.have.a.property("middlewares");
        });

        it("should have property services", function() {
            lib.should.have.a.property("services");
        });

        it("should have property utils", function() {
            lib.should.have.a.property("utils");
        });
    });

    context("middlewares", function() {
        const middlewares = require('../middlewares');

        it("should have property logger", function() {
            middlewares.should.have.a.property("logger");
        });

        it("should have property longPoll", function() {
            middlewares.should.have.a.property("longPoll");
        });

        it("should have property runAfter", function() {
            middlewares.should.have.a.property("runAfter");
        });

        it("should have property sharedSecret", function() {
            middlewares.should.have.a.property("sharedSecret");
        });

        it("should have property tokenDecorator", function() {
            middlewares.should.have.a.property("tokenDecorator");
        });
    });

    context("services", function() {
        const services = require('../services');

        it("should have property dwhApi", function() {
            services.should.have.a.property("dwhApi");
        });

        it("should have property monitoring", function() {
            services.should.have.a.property("monitoring");
        });

        it("should have property urm", function() {
            services.should.have.a.property("urm");
        });
    });

    context("utils", function() {
        const utils = require('../utils');

        it("should have property logger", function() {
            utils.should.have.a.property("logger");
        });
    });
});
