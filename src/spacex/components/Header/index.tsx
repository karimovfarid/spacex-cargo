import React, { ChangeEvent, FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import logo from '../../../Logo.png';
import { CargoDetailsActionCreator } from '../../redux/ducks/cargoDetails';
import './index.scss';


interface IProps {
    open?:boolean;
    handleMenuStatus?:any
}
const Header: FC<IProps> = (props:IProps)=> {
    const {open, handleMenuStatus} = props;
    const dispatch = useDispatch();

    const handleSearchInput = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => dispatch(CargoDetailsActionCreator.searchCargo(event.target.value)),
        [dispatch]
    )

    return (
        <header className="spacex-header">
            <div className="row">
                <div className="col-2 col-xs-12">
                    <div className="spacex-header-content">
                        <img src={logo} alt=""/>
                        <div className={`spacex-header-menu ${open ? 'spacex-header-menu-close' : ''}`}
                             onClick={() => handleMenuStatus(!open)}></div>
                    </div>
                </div>
                <div className="col-9 col-xs-12">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            name="cargo-box"
                            onChange={handleSearchInput}
                            placeholder="Search"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
