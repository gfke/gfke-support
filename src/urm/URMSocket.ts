import * as socketClient from 'socket.io-client'
import * as _ from 'lodash'
import * as Promise from 'bluebird'
import * as debug from 'debug'
import * as ProxyAgent from 'https-proxy-agent'
import * as join from 'join-path'

import {parse, Url} from 'url'
import {removeLine} from '../util/String'

declare module 'https-proxy-agent' {
    export default function (url: Url)
}

export interface IURMSocketOptions {
    url: string,
    eventPrefix: string
    timeout: number

    proxy?: string

    io?: SocketIOClient.ConnectOpts,

    events?: {
        [eventName: string]: Function
    }
}

export const defaultURMSocketOptions: IURMSocketOptions = {
    url: '',
    eventPrefix: '',
    timeout: 5000, // 5s

    io: {
        autoConnect: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 20000 // 20s
    }
}

export class URMSocket {
    private _debug: debug.IDebugger = debug('@gfke/support/urm-socket')
    private _options: IURMSocketOptions

    private _socket: SocketIOClient.Socket

    constructor (options: IURMSocketOptions) {
        this._debug('setup new URM client instance')
        this._options = _.defaults(options, defaultURMSocketOptions)

        if (this.options.proxy) {
            this._debug('activate proxy agent: %s', this.options.proxy)
            this._options.io.agent = new ProxyAgent(parse(this.options.proxy))
        }

        if (_.isEmpty(this.options.url)) throw new Error('No URM Socket URL defined')

        this._socket = socketClient(this.options.url, this.options.io)

        if (this.options.events) {
            _.forEach(this.options.events, (event: Function, eventName: string) => {
                this._socket.on(eventName, event.bind(this))
            })
        }
    }

    get options (): IURMSocketOptions {
        return this._options
    }

    get socket (): SocketIOClient.Socket {
        return this._socket
    }

    emit (event: string, data: {}, onResponse?: Function, onError?: Function) {
        const stack = new Error().stack
        event = join(this.options.eventPrefix, event)

        this._debug('emit %s', event)
        this._debug('send %s', JSON.stringify(data, null, 4))
        this.socket.emit(event, data)

        return new Promise((resolve, reject) => {
            this.socket.once(event, data => {
                try {
                    if (data.status) {
                        resolve(onResponse.call(this, data) || data)
                    } else {
                        reject(new URMSocketError(data.message, data.statusCode, stack))
                    }
                } catch (error) {
                    reject(error)
                }
            })
        })
            .timeout(this.options.timeout)
            .catch(Promise.TimeoutError, () => {
                throw new URMSocketError('Socket timeout', 500, stack)
            })
            .catch((error: URMSocketError) => {
                if (_.isError(error) === false) error = new URMSocketError(error, 500, stack)

                error.event = event
                error.options = this.options
                error.data = data

                if (onError) error = onError.call(this, error) || error

                throw error
            })
    }
}

export interface IURMSocketError extends Error {
    status: number

    event: string
    options: IURMSocketOptions
    data: {}
}

export class URMSocketError extends Error implements IURMSocketError {
    status: number

    event: string
    options: IURMSocketOptions
    data: {}

    /**
     * @param {string} message Exception text
     * @param {number} statusCode HTTP Error code that fits the occured error
     * @param {string} previousStack Stack from previous frame
     */
    constructor (message, statusCode, previousStack) {
        super(message)
        this.status = statusCode

        //Remove the first two line from both stacks as
        //they would only be the line where the error was created
        //and a superfluous error message
        previousStack = removeLine(previousStack)
        previousStack = removeLine(previousStack)
        this.stack = removeLine(this.stack)
        this.stack = removeLine(this.stack)

        //Combine both stacks to provide all available information
        this.stack = `\n${this.stack}\nFrom previous event:\n${previousStack}`
    }
}
