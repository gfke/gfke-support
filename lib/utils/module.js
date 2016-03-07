'use strict';

exports.runIfNoParent = function(app, module) {
    if(!module.parent) {
        app.server = app.listen(
            app.context.config.port, 
            app.context.config.ip, 
            function(err) {
                if(err) {
                    app.log.error(err);
                } else {
                    app.log.info(`Application running on ${app.context.config.host()}`);
                }
            }
        );
    }
};
