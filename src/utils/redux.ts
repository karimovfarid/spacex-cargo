import { EProcessStatus } from '../enum';
import { IAsyncData, IError, IItem } from '../models';
import { Action, ActionCreator, AsyncActionCreators, Failure, isType, Success } from 'typescript-fsa';


/**
 * Get async data branch.
 *
 * @param data {T} Entity data.
 * @param meta {M} Meta information about entity.
 * @param error {Error} Error object.
 * @param status {EProcessStatus} Current branch status.
 */
export const getAsyncData = <T, M = any>(
    data: T = null,
    meta: M = null,
    error: Error = null,
    status: EProcessStatus = EProcessStatus.IDLE,
): IAsyncData<T, M> => ({ data, meta, error, status });

/**
 * Initial async data.
 */
// @ts-ignore
export const getInitialAsyncData = <T, M = any>(initialData: T = null, initialMeta: M = null): IAsyncData<T, M> =>
    getAsyncData(initialData, initialMeta);

/**
 * Success payload type.
 */
export type TSuccessPayload<P, T, M = any> = Success<P, IItem<T, M>>;

/**
 * Failure payload type.
 */
export type TFailurePayload<P> = Failure<P, IError>;

/**
 * Async action Payload type.
 */
export type TAsyncActionPayload<P, T, M = any> = TSuccessPayload<P, T, M> | TFailurePayload<P>;

/**
 * Action payload type.
 */
export type TActionPayload<P, T, M = any> = P | TAsyncActionPayload<P, T, M>;

/**
 * Async action type.
 */
export type TAsyncAction<P, T, M = any> = Action<TAsyncActionPayload<P, T, M>>;

/**
 * Action type.
 */
export type TAction<P, T, M = any> = Action<TActionPayload<P, T, M>>;

/**
 * Reducer async handler type.
 */
type TReducerHandlerAsync<P, T, M> = (state: IAsyncData<T>, action: TAction<P, T, M>) => IAsyncData<T>;

/**
 * Async reducers handler type.
 */
type TAsyncReducerHandlers<P, T, M> = { [key in keyof AsyncActionCreators<P, IItem<T> | T, IError>]: TReducerHandlerAsync<P, T, M> };

/**
 * Async default handlers.
 */
export function asyncDefaultHandlers<P, T, M = any> (): Partial<TAsyncReducerHandlers<P, T, M>> {
    return {
        started: state => ({
            ...state,
            status: EProcessStatus.PENDING,
        }),
        done: (state, action) => {
            const result = (action as Action<TSuccessPayload<P, T, M>>).payload.result;
            const { data, meta } = result || ({} as typeof result);
            return {
                data,
                meta,
                error: null,
                status: EProcessStatus.SUCCESS,
            };
        },
        failed: (state, action) => ({
            ...state,
            error: (action as Action<TFailurePayload<P>>).payload.error,
            status: EProcessStatus.ERROR,
        }),
    };
}

/**
 * Standard reducers generator for asynchronous data.
 *
 * @param asyncActionCreator Base action creator.
 * @param initialData
 * @param initialMeta
 * @param {P} [payloadData] Payload data.
 * @param {T} [responseData] Response data.
 * @param {M} [responseMeta] Response meta.
 */
export function asyncItemDefaultReducerGenerator<P, T, M = any> (
    asyncActionCreator: AsyncActionCreators<P, IItem<T> | T, IError>,
    initialData?: T,
    initialMeta?: M,
): (store: IAsyncData<T, M>, action: TAsyncAction<P, T, M>) => IAsyncData<T, M> {
    return (state: IAsyncData<T, M> = getInitialAsyncData<T>(initialData, initialMeta), action: TAsyncAction<P, T, M>): IAsyncData<T, M> => {
        if (isType(action, asyncActionCreator.started)) {
            return asyncDefaultHandlers<P, T>().started(state, action);
        }

        if (isType(action, asyncActionCreator.done)) {
            return asyncDefaultHandlers<P, T, M>().done(state, action);
        }

        if (isType(action, asyncActionCreator.failed)) {
            return asyncDefaultHandlers<P, T>().failed(state, action);
        }

        return state;
    };
}

/**
 * Reducer handler type.
 */
type TReducerHandler<P, T> = (state: T, action: Action<P>) => T;

/**
 * Reducer handler interface.
 */
interface IReducerHandler<P, T> {
    actionCreator: ActionCreator<P>;
    handler: TReducerHandler<P, T>;
}

// TODO Refactor: asyncItemCustomReducer and itemCustomReducer are almost the same.
/**
 * Custom reducers generator for synchronous data.
 *
 * @param reducerHandlers
 * @param initialData
 * @param {P} [payloadData] Payload data.
 * @param {T} [responseData] Response data.
 */
export function itemCustomReducer<P, T> (reducerHandlers: IReducerHandler<P, T>[] = [], initialData?: T): (store: T, action: Action<P>) => T {
    return (state: T = initialData || null as any, action: Action<P>): T => {
        const reducerHandler = reducerHandlers.find((handler: IReducerHandler<P, T>) => isType(action, handler.actionCreator));
        if (reducerHandler) {
            return reducerHandler.handler(state, action);
        }
        return state;
    };
}

/**
 * Reducer async handler interface.
 */
interface IReducerHandlerAsync<P, T, M> {
    actionCreator: ActionCreator<P | Success<P, IItem<T> | T> | Failure<P, IError>>;
    handler: TReducerHandlerAsync<P, T, M>;
}

/**
 * Custom reducers generator for asynchronous data.
 *
 * @param reducerHandlers
 * @param initialData
 * @param initialMeta
 * @param {P} [payloadData] Payload data.
 * @param {T} [responseData] Response data.
 * @param {M} [responseMeta] Response meta.
 */
export function asyncItemCustomReducer<P, T, M = any> (
    reducerHandlers: IReducerHandlerAsync<P, T, M>[] = [],
    initialData?: T,
    initialMeta?: M,
): (store: IAsyncData<T, M>, action: TAction<P, T, M>) => IAsyncData<T, M> {
    return (state: IAsyncData<T, M> = getInitialAsyncData<T>(initialData, initialMeta), action: TAction<P, T, M>): IAsyncData<T, M> => {
        const reducerHandler = reducerHandlers.find((handler: IReducerHandlerAsync<P, T, M>) => isType(action, handler.actionCreator));
        if (reducerHandler) {
            return reducerHandler.handler(state, action);
        }
        return state;
    };
}
