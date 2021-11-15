import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

import { CargoDetailsSelectors } from '../../redux/ducks/cargoDetails';
import { calculateNumberOfCargoBays } from '../../../utils/calculations';
import { ICargoReduxState } from '../../redux/model';
import './index.scss';

interface ParamType {
    id: string
}

const ShipmentDetail: FC = () => {
    const { id } = useParams<ParamType>();
    const cargoDetail = useSelector((state:ICargoReduxState) => CargoDetailsSelectors.getCargoDetailById(state, id));
    const [cargoBoxes, setCargoBoxes] = useState<string>('');

    useEffect(() => {
        setCargoBoxes(cargoDetail.boxes)
    }, [id]);

    const handleBoxOnChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => setCargoBoxes(event.target.value),
        [setCargoBoxes]
    );

    return (
        <div className="spacex-shipment-details">
            <h2 className="spacex-shipment-details-title">{cargoDetail?.name}</h2>
            <div>{cargoDetail?.email}</div>
            <div className="form-group">
                <label htmlFor="cargo-box">Cargo boxes</label>
                <input
                    type="text"
                    className="form-control"
                    name="cargo-box"
                    value={cargoBoxes}
                    onChange={handleBoxOnChange}
                />
            </div>
            <p className="spacex-shipment-details_bays">Number of required cargo bays</p>
            <p className="spacex-shipment-details_bays-count">{calculateNumberOfCargoBays(cargoBoxes)}</p>
        </div>
    );
};

export default ShipmentDetail;
