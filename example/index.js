'use strict';

const config = require("dotenv").config();

const lib = require("..");

const debug = require('debug')('gfke-support:example');
const koa = require("koa");

const routes = require("./routes");
const dwhApiPaths = require("../dwh-api-paths.json");
const urmPaths = require("../urm-paths.json");

const app = module.exports = koa();
app.context.config = config;

app.context.monitor = lib.services.monitor();
// app.context.monitor = lib.services.monitor('graphite', {
//     host: config.HOSTED_GRAPHITE_HOST,
//     port: config.HOSTED_GRAPHITE_PORT,
//     prefix: `${config.HOSTED_GRAPHITE_APIKEY}.${app.env}`
// });

app.context.cache = lib.services.cache(app.context.monitor);
// app.context.cache = lib.services.cache(app.context.monitor, 'redis', {
//     redisUrl: config.REDIS_URL,
//     redisDatabase: config.REDIS_DB
// });

app.context.urm = new lib.services.urm.URMService({
    url: config.URM_URL,
    socket: {
        url: config.URM_SOCKET_URL,
        baseEvent: config.URM_SOCKET_BASE_EVENT
    },
    paths: urmPaths
});

app.context.dwhApi = new lib.services.dwhApi.DwhApiService({
    url: config.DWHAPI_URL,
    domain: config.DWHAPI_DOMAIN,
    tokenHeader: config.TOKEN_HEADER,
    paths: dwhApiPaths
});

routes(app);

if(!module.parent) {
    app.listen(
        process.env.PORT, 
        process.env.IP, 
        (err) => {
            if(err) {
                throw err;
            }
            
            debug(
                "Running example on %s:%s", 
                process.env.IP, 
                process.env.PORT
            );
        }
    );
}
