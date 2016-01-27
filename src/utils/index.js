'use strict';

import cache from './cache.js';
import logger from './logger.js';
import removeLine from './removeLine.js';
import {SocketError, default as socket} from './socket.js';

export default {
    cache,
    logger,
    removeLine,
    socket,
    SocketError
};
