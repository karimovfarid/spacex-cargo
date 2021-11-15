import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { History } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { CargoDetailsReducer, initialState as cargoDetailsInitialReduxState } from '../ducks/cargoDetails';

import { rootSaga } from '../saga';

/**
 * Spacex cargo initial redux store state.
 */
const cargoDetailInitialReduxState = () => {
    return {
        cargoDetails: cargoDetailsInitialReduxState,
    };
};

/**
 * Spacex cargo application redux store initialization.
 */
export const initStore = (history: History) => {
    const reducersList = {
        cargoDetails: CargoDetailsReducer,
        router: connectRouter(history) as Reducer<any>,
    };
    const appReducers = combineReducers<any>(reducersList);
    const sagaMiddleware = createSagaMiddleware();
    const reactRouterMiddleware = routerMiddleware(history);
    const store = createStore(appReducers, cargoDetailInitialReduxState(), applyMiddleware(sagaMiddleware, reactRouterMiddleware));
    sagaMiddleware.run(rootSaga);

    return store;
};
