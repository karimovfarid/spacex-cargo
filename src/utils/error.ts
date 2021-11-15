import { AxiosError } from 'axios';
import React from 'react';

import { IError } from '../models';

import { blobReader } from './blobReader';

/**
 * Check whether the object is IError (Typeguard function).
 *
 * @param {any | IError} obj Checked object.
 */
export function isError (obj: any | IError): obj is IError {
    return Boolean(obj) && Boolean((obj as IError).message) && Boolean((obj as IError).code);
}

/**
 * Error wrapper.
 *
 * @param error Server-side or browser-side error.
 * @returns Error wrapped into IErrorsResult object.
 */
export async function errorWrapper (error: AxiosError): Promise<IError> {
    const defaultErrorMessage = 'Error.unknown';
    let result: IError;

    if (error.response) {
        let data: any = error.response.data;

        result = {
            code: error.response.statusText || 'UNKNOWN_ERROR',
            httpCode: error.response.status || 400,
            message: defaultErrorMessage,
            error: true,
        };

        if (error.response.data) {
            // Parse error for Blob response.
            if (data instanceof Blob && data.type && data.type.toLowerCase().indexOf('json') !== -1) {
                try {
                    const content = await blobReader(data);
                    data = JSON.parse(content);
                } catch (e:any) {
                    result = {
                        code: error.response.statusText || 'UNKNOWN_ERROR',
                        httpCode: error.response.status || 400,
                        message: e.message,
                        error: true,
                    };
                }
            }

            /* tslint:enable */
            if (isError(data)) {
                // server managed error
                result = { ...data, error: true, httpCode: error.response.status };
            }
        }
    } else {
        result = {
            code: error.code || 'UNKNOWN_ERROR',
            httpCode: error.code === 'ECONNABORTED' ? 408 : 400,
            message: defaultErrorMessage,
            error: true,
        };
    }

    return result;
}

/**
 * Logs error to the server.
 *
 * @param {Error} error JavaScript Error object.
 * @param {React.ErrorInfo} info Stacktrace information.
 */
export function logError (error: Error, info: React.ErrorInfo): void {
    // TODO: Log error. For now just printing it to console.
    // tslint:disable-next-line:no-console
    console.error('Unknown exception caught!', error, info);
}
