import { call, takeLatest } from 'redux-saga/effects';
import actionCreatorFactory, { Action } from 'typescript-fsa';
import { bindAsyncAction } from 'typescript-fsa-redux-saga';
import { SagaIterator } from 'redux-saga';

import { getDuckActionNamespace } from '../utils';
import {
    asyncDefaultHandlers,
    asyncItemCustomReducer,
    getInitialAsyncData,
} from '../../../utils/redux';
import { RestClient } from '../../../utils/rest';
import { API } from '../../api';
import { IAsyncData, IError, IItems } from '../../../models';
import { ICargoReduxState } from '../model';

const reducerName = 'cargoDetails';

//#region Models
/*Cargo details model*/
export interface ICargoDetail {
    id: string;
    name: string;
    email: string;
    boxes: string;
}

export interface ICargoDetailsRs extends IItems<ICargoDetail> {
}
//#endregion

//#region Action Creators

/** Cargo details action creator factory. */
const actionCreator = actionCreatorFactory(getDuckActionNamespace(reducerName));

/** Cargo details action creators. */
export const CargoDetailsActionCreator = {
    cargoDetails: actionCreator.async<null, IItems<ICargoDetail>, IError>('CARGO_DETAILS'),
    searchCargo: actionCreator<string>('SEARCH_CARGO'),
};
//#endregion.

//#region Reducer

/*Cargo reducer inital state*/
export const initialState: IAsyncData<ICargoDetail[]> = getInitialAsyncData<ICargoDetail[]>();

/** Cargo details reducer. */
export const CargoDetailsReducer = asyncItemCustomReducer<any, any>([
    {
        actionCreator: CargoDetailsActionCreator.cargoDetails.started,
        handler: asyncDefaultHandlers().started,
    },
    {
        actionCreator: CargoDetailsActionCreator.cargoDetails.done,
        handler: asyncDefaultHandlers().done,
    },
    {
        actionCreator: CargoDetailsActionCreator.cargoDetails.failed,
        handler: asyncDefaultHandlers().failed,
    },
    {
        actionCreator: CargoDetailsActionCreator.searchCargo,
        handler: (state, action) => {
            const payload = (action as Action<string>).payload;
            const updatedState = state.data.filter(item => {
                return item.name.toLowerCase().search(payload.toLowerCase()) !== -1;
            });
            return {
                ...state,
                data: updatedState,
            };
        },
    },
]);
//#endregion.

//#region Services
const restClient = new RestClient();

/** Cargo details services. */
export const CargoDetailsServices = {
    /** Cargo details method. */
    details(): Promise<ICargoDetailsRs> {
        return restClient.get<ICargoDetailsRs>(API.endpoints.companies.details);
    },
};
//#endregion

//#region Sagas

/** Workers. */
const cargoDetailsWorkers = {
    /** Create cargo details saga worker. */
    cargoDetailsWorkers: bindAsyncAction(CargoDetailsActionCreator.cargoDetails, {
        skipStartedAction: true,
    })(function* (): SagaIterator {
        return yield call(CargoDetailsServices.details);
    }),
};

/** Cargo details saga. */
export const cargoDetailsWatchers = [
    takeLatest(CargoDetailsActionCreator.cargoDetails.started, cargoDetailsWorkers.cargoDetailsWorkers),
];
//#endregion

//#region Selectors

/** Cargo Details selectors. */
export const CargoDetailsSelectors = {
    /** Returns cargo details from redux state.  */
    getCargoDetailsBranch(state: ICargoReduxState): IAsyncData<ICargoDetail[]> {
        return state.cargoDetails;
    },
    /** Returns cargo details by id.  */
    getCargoDetailById(state: ICargoReduxState, id: string): any {
        const { data } = state.cargoDetails;
        return data ? data.find((e: ICargoDetail) => e.id === id) : {};
    },
};

//#endregion
