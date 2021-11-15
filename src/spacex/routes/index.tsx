import { Redirect, Route, Switch } from 'react-router';
import React from "react";

import {ROUTES} from "./const";
import Companies from '../components/Page';

/**
 * Main application routes.
 */
export const Routes: JSX.Element = (
    <Switch>
        <Route path={ROUTES.DASHBOARD_PAGE.PATH} component={Companies}/>
        <Route exact path={ROUTES.MAIN_PAGE.PATH}>
            <Redirect to={ROUTES.DASHBOARD_PAGE.PATH} />
        </Route>
    </Switch>
);
