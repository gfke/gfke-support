'use strict';

const lib = require('..');

const koaRouter = require('koa-router');
const koaBetterBody = require('koa-better-body');

module.exports = function (app) {
    const router = new koaRouter();
    
    app.use(lib.middlewares.error);
    app.use(koaBetterBody());
    
    app.use(lib.middlewares.headerKey(
        app.context.config.TOKEN_HEADER, 
        'token'
    ));
    
    router.get('/test', function*() {
        this.body = 'test';
    });
    
    router.get(
        '/requiredHeaderKey', 
        lib.middlewares.requiredHeaderKey(
            app.context.config.SHARED_SECRET_HEADER,
            app.context.config.SHARED_SECRET
        ),
        function*() {
            this.body = 'requiredHeaderKey valid';
        }
    );
    
    router.post('/urm/:action', function * () {
        console.log(this.request.body);
        this.body = yield this.app.context
            .urm[this.params.action](this.request.body.fields);
    });
    
    router.post('/dwhapi/:action/:suffix?', function * () {
        this.body = yield this.app.context.dwhApi[this.params.action](
            this.request.token,
            this.request.body.fields,
            this.params.suffix
        );
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
};
