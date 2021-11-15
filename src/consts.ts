/** Session token name. */
import { AxiosRequestConfig } from 'axios';

export const TOKEN_NAME = 'accessToken';

/**
 * Common REST configuration.
 */
export const defaultCacheConfig = {
    frequentlyChanged: {
        maxAge: 60 * 1000, // 1 min
    },
    infrequentlyChanged: {
        maxAge: 60 * 60 * 1000, // 1 hour
    },
    prefix: 'sp',
};

/** Default application path. */
export const DEFAULT_PATH = '/';

/**
 * Common REST configuration.
 */
export const commonRestConfig: AxiosRequestConfig = {
    baseURL: 'http://localhost:8000',
    timeout: 120000,
};

/** Refresh token  name. */
export const TOKEN_REFRESH_NAME = 'refreshToken';

export const COOKIES_PARAMS = window.location.origin.includes('test')
    ? {
        domain: '.test',
        // httpOnly: true,
        // sameSite: 'strict',
        secure: true,
    }
    : {};
