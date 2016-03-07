'use strict';

exports.services = {
    cache: require('./services/cache'),
    monitor: require('./services/monitor'),
    
    dwhApi: {
        DwhApiService: require('./services/dwh-api/dwh-api-service')
    },
    
    urm: {
        URMService: require('./services/urm/urm-service'),
        SocketError: require('./services/urm/socket-error')
    }
};


exports.middlewares = require('./middlewares');
exports.utils = require('./utils');
