import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupCache } from 'axios-cache-adapter';
import Cookies from 'js-cookie';
import localforage from 'localforage';

import { commonRestConfig, COOKIES_PARAMS, DEFAULT_PATH, defaultCacheConfig, TOKEN_NAME, TOKEN_REFRESH_NAME } from '../consts';
import { errorWrapper } from './error';
import { IRestClient } from '../models';

/**
 * HTTP request method.
 */
type TRequestMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Refresh token request promise.
 */
export let refreshTokenPromise: Promise<any> | null = null;

/**
 * Redirect utility.
 */
export function redirect (url: string): void {
    window.location.assign(url);
}

/**
 * Get authorization header.
 */
function getAuthHeader (): string {
    return Cookies.get(TOKEN_NAME) ? `Bearer ${Cookies.get(TOKEN_NAME)}` : '';
}

/**
 * Rest client.
 */
export class RestClient implements IRestClient {
    public readonly axios: AxiosInstance;
    private readonly cacheStorage: LocalForage;

    constructor (axiosInstance?: AxiosInstance, cacheStorageInstance?: LocalForage) {
        // Storage for cache objects.
        this.cacheStorage =
            cacheStorageInstance ||
            localforage.createInstance({
                driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
                name: defaultCacheConfig.prefix,
            });

        // Configure cache provider.
        const cache = setupCache({
            store: this.cacheStorage,
        });

        // Rest client instance.
        this.axios =
            axiosInstance ||
            Axios.create({
                adapter: cache.adapter,
            });
    }

    /**
     * Executing HTTP API request.
     *
     * @param {TRequestMethod} method HTTP request method.
     * @param {string} url Request URL.
     * @param {TRequestData} data Data for POST/PUT requests.
     * @param {AxiosRequestConfig} config Optional config.
     */
    private async requestApi<TRequestData, TResponseData> (
        method: TRequestMethod,
        url: string,
        data: TRequestData,
        config: AxiosRequestConfig = {
            headers: {
                Authorization: getAuthHeader(),
            },
        },
    ): Promise<AxiosResponse> {
        const requestConfig: AxiosRequestConfig = {
            ...commonRestConfig,
            ...config,
            headers: {
                ...config.headers,
                Authorization: getAuthHeader(),
            },
            cache: {
                ...config.cache,
                exclude: {
                    // Cache only requests with 'cache' options passed.
                    filter: () => !Boolean(config.cache),
                    ...(config.cache && config.cache.exclude),
                },
            },
            data,
            method,
            url,
        };

        return new Promise<AxiosResponse>(async (resolve, reject) => {
            try {
                const response = await this.axios.request(requestConfig);
                resolve(response);
            } catch (error:any) {
                const wrappedError = await errorWrapper(error);

                switch (wrappedError.httpCode) {
                    case 401:
                        // If status === UNAUTHORIZED - redirect to login page.
                        [TOKEN_NAME, TOKEN_REFRESH_NAME].forEach(k => {
                            localStorage.removeItem(k); // @TODO remove after 1month.
                            Cookies.remove(k, { ...COOKIES_PARAMS });
                        });
                        redirect(DEFAULT_PATH);
                        break;
                    case 406:
                        // If status === NOT_ACCEPTABLE - refresh token.
                        if (!refreshTokenPromise) {
                            [TOKEN_NAME, TOKEN_REFRESH_NAME].forEach(k => {
                                localStorage.removeItem(k); // @TODO remove after 1month.
                                Cookies.remove(k, { ...COOKIES_PARAMS });
                            });
                            redirect(DEFAULT_PATH);
                            break;
                            // refreshTokenPromise = this.post(TOKEN_REFRESH_PATH, {
                            //     [TOKEN_REFRESH_NAME]: Cookies.get(TOKEN_REFRESH_NAME),
                            // });
                        }

                        try {
                            // const response: IItem<any> = await refreshTokenPromise;
                            const response: any = await refreshTokenPromise;
                            // If token was refreshed, try request again.
                            if (response.data && response.data[TOKEN_NAME]) {
                                Cookies.set(TOKEN_NAME, response.data[TOKEN_NAME], {
                                    ...COOKIES_PARAMS,
                                });
                                resolve(this.requestApi(method, url, data, requestConfig));
                                refreshTokenPromise = null;
                            } else {
                                reject(wrappedError);
                            }
                        } catch (error) {
                            // Else move to login page.
                            refreshTokenPromise = null;
                            localStorage.removeItem(TOKEN_NAME);
                            Cookies.remove(TOKEN_NAME);
                            redirect(DEFAULT_PATH);
                        }
                        break;
                    default:
                        reject(wrappedError);
                }
            }
        });
    }

    /**
     * GET request method.
     *
     * @param {string} url REST path.
     * @param {AxiosRequestConfig} config Optional config.
     */
    public async get<TResponseData> (url: string, config?: AxiosRequestConfig): Promise<TResponseData> {
        const response = await this.requestApi('get', url, {}, config);
        return response.data;
    }

    /**
     * POST request method.
     *
     * @param {string} url REST path.
     * @param {TRequestData} data Data for POST request.
     * @param {AxiosRequestConfig} config Optional config.
     */
    public async post<TRequestData, TResponseData> (url: string, data?: TRequestData, config?: AxiosRequestConfig): Promise<TResponseData> {
        const response = await this.requestApi('post', url, data, config);
        return response.data;
    }

    /**
     * PUT request method.
     *
     * @param {string} url REST path.
     * @param {TRequestData} data Data for PUT request.
     * @param {AxiosRequestConfig} config Optional config.
     */
    public async put<TRequestData, TResponseData> (url: string, data?: TRequestData, config?: AxiosRequestConfig): Promise<TResponseData> {
        const response = await this.requestApi('put', url, data, config);
        return response.data;
    }

    /**
     * DELETE request method.
     *
     * @param {string} url REST path.
     * @param {AxiosRequestConfig} config Optional config.
     */
    public async del<TResponseData> (url: string, config?: AxiosRequestConfig): Promise<TResponseData> {
        const response = await this.requestApi('delete', url, null, config);
        return response.data;
    }
}
