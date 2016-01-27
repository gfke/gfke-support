# 0.2.0
Support given for node >=5.2.

* module name changed: ``` gfke-support ```
* changed all property names to lowercased camelCase.
* utils:
    * all from ``` 0.1.0 ```
* services:
    * dwhapi
    * urm
    * monitoring
    * koa
* middlewares:
    * all from ``` 0.1.0 ```
    * sharedSecret

**usage**:
same like ``` 0.1.0 ```, but with changed modulename and lowercased.

```JavaScript
// es6 babel 6
import {utils, services, middlewares} from 'gfke-support';

// es6 pure with enabled es6 feature (e.g. --harmony_destructuring)
const {utils, services, middlewares} = require('gfke-support');
```

shortcuts added:

```JavaScript
// es6 babel 6
import utils from 'gfke-support/utils';
import services from 'gfke-support/services';
import middlewares from 'gfke-support/middlewares';

// es6 pure
const utils = require('gfke-support/utils');
const services = require('gfke-support/services');
const middlewares = require('gfke-support/middlewares');
```

easy with destructuring:
```JavaScript
// es6 babel 6
import {logger} from 'gfke-support/utils';
import {dwhApi} from 'gfke-support/services'; // is Class
import {runAfter} from 'gfke-support/middlewares';

// es6 pure with enabled es6 feature (e.g. --harmony_destructuring)
const {logger} = require('gfke-support/utils');
const {dwhApi} = require('gfke-support/services'); // is Class
const {runAfter} = require('gfke-support/middlewares');
```
# 0.1.0

Written with babel6 for es2015.

* module name: ``` node-module-middleware ```
* utils:
    * logger
* services:
    * dwhapi
    * urm
* middlewares
    * logger
    * longpoll
    * runafter
    * tokendecorator

**usage**:
```JavaScript
// es6 babel 6
import {Utils, Services, Middlewares} from 'node-module-middleware';

// es6 pure with enabled es6 feature (e.g. --harmony_destructuring)
const {Utils, Services, Middlewares} = require('node-module-middleware');
```
