import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ROUTES } from '../routes/const';
import { Route, generatePath, useHistory } from 'react-router';
import ShipmentDetail from './ShipmentDetail';
import Header from './Header';

import { CargoDetailsActionCreator, CargoDetailsSelectors, ICargoDetail } from '../redux/ducks/cargoDetails';
import { EProcessStatus } from '../../enum';
import { ICargoReduxState } from '../redux/model';

import './index.scss';

/*Companies*/
const Companies: React.FunctionComponent = () => {
    const history = useHistory();
    const { data, status } = useSelector((state: ICargoReduxState) => CargoDetailsSelectors.getCargoDetailsBranch(state));
    const dispatch = useDispatch();
    const loading = status === EProcessStatus.PENDING;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        dispatch(CargoDetailsActionCreator.cargoDetails.started(null));
    }, []);

    /*Go to shipment detail*/
    const goToShipmentDetail = (id: string) => {
        history.push(generatePath(ROUTES.DASHBOARD_COMPANIES_PAGE.PATH, {
            id,
        }));
    };

    return (
        <>
            <Header
                open={open}
                handleMenuStatus={setOpen}
            />
            {loading ? (<div>...Loading</div>) : (
                <section className="spacex-shipment">
                    <div className="row">
                        <div className="col-2 col-xs-12">
                            <div className={`spacex-shipment-list ${open ? 'spacex-shipment-list-open' : ''}`}>
                                <h3 className="spacex-shipment-list-title">Shipment List</h3>
                                <ul>
                                    {data && data.map((item: ICargoDetail) => (
                                        <li key={item.id}
                                            onClick={() => goToShipmentDetail(item.id)}>{item.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-9 col-xs-12">
                            {<Route path={ROUTES.DASHBOARD_COMPANIES_PAGE.PATH} component={ShipmentDetail}/>}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default Companies;
