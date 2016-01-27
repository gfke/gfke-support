'use strict';

import lib from '..';
import middlewares from '../middlewares.js';
import services from '../services.js';
import utils from '../utils.js';

describe("GFKE Support", () => {
  context("lib", () => {
    it("should have property middlewares", () => {
      lib.should.have.a.property("middlewares");
    });

    it("should have property services", () => {
      lib.should.have.a.property("services");
    });

    it("should have property utils", () => {
      lib.should.have.a.property("utils");
    });
  });

  context("middlewares", () => {
    it("should have property logger", () => {
      middlewares.should.have.a.property("logger");
    });

    it("should have property longPoll", () => {
      middlewares.should.have.a.property("longPoll");
    });

    it("should have property runAfter", () => {
      middlewares.should.have.a.property("runAfter");
    });

    it("should have property sharedSecret", () => {
      middlewares.should.have.a.property("sharedSecret");
    });

    it("should have property tokenDecorator", () => {
      middlewares.should.have.a.property("tokenDecorator");
    });
  });

  context("services", () => {
    it("should have property dwhApi", () => {
      services.should.have.a.property("dwhApi");
    });

    it("should have property monitoring", () => {
      services.should.have.a.property("monitoring");
    });

    it("should have property urm", () => {
      services.should.have.a.property("urm");
    });
  });

  context("utils", () => {
    it("should have property cache", () => {
      utils.should.have.a.property("cache");
    });

    it("should have property logger", () => {
      utils.should.have.a.property("logger");
    });

    it("should have property removeLine", () => {
      utils.should.have.a.property("removeLine");
    });

    it("should have property socket", () => {
      utils.should.have.a.property("socket");
    });
  });
});
