'use strict';

import _ from 'lodash';
import lruCache from 'lru-cache';

export default function(opts={}) {
    lruCache(_.merge({
        max: 16777216, // 16MB (UTF-8)
        maxAge: 1000 * 60 * 60 // global max age 1 hour
    }, opts));
}
