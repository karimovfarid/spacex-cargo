import { all } from 'redux-saga/effects';
import { cargoDetailsWatchers } from './ducks/cargoDetails';

export function* rootSaga (): IterableIterator<any> {
    yield all([
        ...cargoDetailsWatchers
    ]);
}
