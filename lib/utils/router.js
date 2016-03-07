"use strict";

const _ = require("lodash");
const koaRouter = require("koa-router");

function getAction(property, controller) {
    let action = null;
    if(_.isString(property)) {
        if(controller) {
            action = controller[property];
        } else {
            action = function *() { console.log("ASDASD"); this.body = property; };
        }
    } else if (_.isFunction(property)) {
        action = function *() { this.body = property; };
    } else {
        action = function *() { this.body = property; };
    }
    
    return action;
}

/**
 *  rO = {
        '/abc'          <-- method use /route
        'method /abc'   <-- method (all, get, ...) /route
        use:            <-- will be used before every action of object
        controller:     <-- controller for actions (strings) of current object
        ...: 'string'   <-- without controller raw string will be send
        ...: 'string'   <-- with controller action is search - if not found - throw error
        ...: function   <-- functions is used (make sure it is a generator)
        ...: Array      <-- iterate over array (strings used like before, functions like before)
        ...: Object     <-- rerun this method and paste as nested routes
    }
 * 
 */

exports.parseRoutesObject = function(parentRoute, routesObject, parentController) {
    const router = new koaRouter();
    
    if(_.isString(parentRoute) === false) {
        routesObject = parentRoute;
        parentRoute = "";
    }
    
    const currentController = routesObject.controller || parentController || null;
    
    _.forEach(routesObject, (property, key) => {
        const keyParts = key.split(' ');
        const method = keyParts[1] ? keyParts[0] : 'use';
        const route = parentRoute+(keyParts[1] || keyParts[0]);
        
        console.log("METHOD:", method, "ROUTE:", route);
        
        if(_.isArray(property)) {
            property.forEach(function(p) {
                // router[method](route, getAction(p, currentController));
            });
        } else {
            router[method](route, getAction(property, currentController));
        }
    });
    
    return router;
};
