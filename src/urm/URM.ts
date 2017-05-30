import * as debug from 'debug'
import * as _ from 'lodash'
import * as rp from 'request-promise'
import * as join from 'join-path'
import {IURMSocketOptions, URMSocket} from './URMSocket'

declare module 'join-path' {
    export default function (...strings): string
}

export interface IURMOptions {
    url: string,
    requestOptions?: rp.OptionsWithUri
    socket?: IURMSocketOptions
}

export interface IURMErrorResponse extends Error {
    error: Error
    statusCode?: number
    data?: {}
    requestOptions?: {}
}

export const defaultURMOptions: IURMOptions = {
    url: '',
    requestOptions: {
        uri: '',
        method: 'POST',
        json: {},
        gzip: true,
        headers: {}
    }
}

export class URM {
    private _debug: debug.IDebugger = debug('@gfke/support/urm')
    private _options: IURMOptions

    private _urmSocket: URMSocket

    constructor (options: IURMOptions) {
        this._debug('setup new URM client instance')
        this._options = _.defaults(options, defaultURMOptions)

        if (_.isEmpty(this.options.url)) throw new Error('No URM URL defined')

        if (this.options.socket) this._urmSocket = new URMSocket(this.options.socket)
    }

    get options (): IURMOptions {
        return this._options
    }

    get urmSocket (): URMSocket {
        return this._urmSocket
    }

    emit (event: string, data: {}, onResponse?: Function, onError?: Function) {
        if (this.urmSocket) {
            return this.urmSocket.emit(event, data, onResponse, onError)
        }

        throw new Error('No URM Socket defined')
    }

    query (route: string, json?: {}, headers?: {}, onResponse?: Function, onError?: Function) {
        const requestOptions = _.cloneDeep(this.options.requestOptions)
        requestOptions.uri = join(this.options.url, route)

        if (headers) requestOptions.json = _.defaults(json, requestOptions.json)
        if (headers) requestOptions.headers = _.defaults(headers, requestOptions.headers)

        requestOptions.transform = (data: any): any => {
            this._debug('got data from %s', requestOptions.uri)
            this._debug('got %s', JSON.stringify(data, null, 4))

            if (onResponse) {
                try {
                    data = onResponse.call(this, data) || data
                } catch (error) {
                    error.data = data
                    throw error
                }
            }

            return data
        }

        this._debug('query %s %s', requestOptions.method, requestOptions.uri)
        this._debug('send %s', JSON.stringify(requestOptions.json, null, 4))
        return rp(requestOptions)
            .catch((error: IURMErrorResponse) => {
                if (_.isUndefined(error.message)) error.message = error.error.message
                if (_.isUndefined(error.statusCode)) error.statusCode = 500
                error.requestOptions = requestOptions

                if (onError) error = onError.call(this, error) || error

                throw error
            })
    }
}
