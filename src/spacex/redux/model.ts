/**
 * Spacex cargo application redux state model.
 */
import { IAsyncData } from '../../models';
import { ICargoDetail } from './ducks/cargoDetails';

export interface ICargoReduxState {
    cargoDetails: IAsyncData<ICargoDetail[]>
}
