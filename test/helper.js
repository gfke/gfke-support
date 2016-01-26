'use strict';

const merge = require('lodash').merge;
const lib = require('..');

// Customize ENV
merge(process.env, {
    NODE_ENV: 'test',

    dwhApiBaseUrl: "https://www.gfk-e.com/staging-dwhapi",
    dwhDomain: "bookdach",

    urmBaseUrl: 'https://webservice-urm-staging.herokuapp.com/api/v1',
    urmSocketUrl: 'wss://webservice-urm-staging.herokuapp.com',
    urmBaseEvent: '/api/v1',
    cacheStrategy: 'memory'
});


// Expose lib globally
global.lib = lib;
