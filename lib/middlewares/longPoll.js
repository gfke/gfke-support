'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function* (next) {
    //Send the headers
    //Tell the client everything is fine and that we will send JSON
    this.status = 200;
    this.type = 'application/json';
    //Chunked response cannot be compressed as the length is unkown
    this.compress = false;

    //Create a PassThrough stream and pipe it directly to node's 'res' object to send a chunked response
    this.chunkedResponse = new _stream.PassThrough();
    this.chunkedResponse.pipe(this.res);
    //Send the first package immediately
    this.chunkedResponse.push(' ');

    //Write a space character to the response every second to keep the connection alive
    //the space will not invalidate the JSON that will be sent later
    const interval = setInterval(() => {
        this.chunkedResponse.push(' ');
    }, 5000);

    try {
        yield next;
    } catch (e) {
        //As it is so late to set the header to an error state, we log it and send an error message to the client
        this.log.error('Error while doing stuff %s', e.message, e.stack);
        this.chunkedResponse.push(JSON.stringify({ error: 'Error while doing stuff' }));
    } finally {
        //Once the data is there, clear the interval
        clearInterval(interval);
        //End the stream
        this.chunkedResponse.push(null);
    }
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stream = require('stream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }