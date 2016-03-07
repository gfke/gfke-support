'use strict';

const PassThrough = require('stream').PassThrough;

/**
 * Use this middleware to start a long polling response to the client
 * that will keep the connection alive through periodically sending empty data
 * The connection will close as soon as the lower functions in the stack have finished
 * NOTE: No Header can be set anymore as soon is this middleware was applied, as the
 * header are sent to the client with the first byte written to the stream
 *
 * @param next
 */
module.exports = function* longPoll(next) {
    //Send the headers
    //Tell the client everything is fine and that we will send JSON
    this.status = 200;
    this.type = 'application/json';
    //Chunked response cannot be compressed as the length is unkown
    this.compress = false;

    //Create a PassThrough stream and pipe it directly to node's 'res' object to send a chunked response
    this.chunkedResponse = new PassThrough();
    this.chunkedResponse.pipe(this.res);
    //Send the first package immediately
    this.chunkedResponse.push(' ');

    //Write a space character to the response every second to keep the connection alive
    //the space will not invalidate the JSON that will be sent later
    const interval = setInterval(()=> {
        this.chunkedResponse.push(' ');
    }, 5000);

    try {
        yield next;
    } catch (e) {
        //As it is so late to set the header to an error state, we log it and send an error message to the client
        this.log.error('Error while doing stuff %s', e.message, e.stack);
        this.chunkedResponse.push(JSON.stringify({error: 'Error while doing stuff'}));
    } finally {
        //Once the data is there, clear the interval
        clearInterval(interval);
        //End the stream
        this.chunkedResponse.push(null);
    }
};
