import { AxiosRequestConfig } from 'axios';
import { EProcessStatus } from './enum';

/**
 * Single item.
 */
export interface IItem<TItem, TMeta = {}> {
    /** Item. */
    data: TItem;

    /** Meta data. */
    meta?: TMeta;
}

/**
 * List.
 */
export interface IItems<TItem, TMeta = {}> {
    /** List of items. */
    data: TItem[];

    /** Meta data. */
    meta?: TMeta;
}

/**
 * Async loading data.
 */
export interface IAsyncData<T, M = any> {
    /** Data. */
    data: T;

    /** Meta. */
    meta?: M;

    /** Error. */
    error?: IError;

    /** Data loading state. */
    status: EProcessStatus;
}

export interface IError {
    /** Error code. */
    code?: string;

    /** HTTP error code. */
    httpCode?: number;

    /** Error flag. */
    error?: boolean;

    /** Error message. */
    message?: string;

    /** Error unique ID. */
    uuid?: string;
}

/**
 * Rest client model.
 */
export interface IRestClient {
    get: <TResponseData>(url: string, config?: AxiosRequestConfig) => Promise<TResponseData>;
    post: <TRequestData, TResponseData>(url: string, data?: TRequestData, config?: AxiosRequestConfig) => Promise<TResponseData>;
    put: <TRequestData, TResponseData>(url: string, data?: TRequestData, config?: AxiosRequestConfig) => Promise<TResponseData>;
    del: <TResponseData>(url: string, config?: AxiosRequestConfig) => Promise<TResponseData>;
}
