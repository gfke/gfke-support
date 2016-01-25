'use strict';

import lruCache from 'lru-cache';

export default lruCache({
    max: 16777216, // 16MB (UTF-8)
    maxAge: 1000 * 60 * 60 // global max age 1 hour
});
