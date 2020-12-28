import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Dashboard from './Dashboard';
import Users from './users';
import Schools from './schools';
import Tweets from './tweets';
import Transactions from './transactions';
import Library from './library';
import { LayoutSplashScreen } from "../../../_metronic";

import CustomSnackbar from './serviceComponents/CustomSnackbar';
import CustomConfirm from './serviceComponents/CustomConfirm';

// import requireAdmin from '../../services/requireAdmin';
// import requireInstructor from '../../services/requireInstructor';

import { firebase, instance } from '../../services';


export default class extends React.Component {
    constructor(props) {
        super(props);
        if (firebase.auth().currentUser) {
            firebase.auth().currentUser.getIdToken().then((token) => {
                instance.defaults.headers.common['authorization'] = "Bearer " + token;
            });
        }
    }
    render() {
        return (
            <Suspense fallback={<LayoutSplashScreen />}>
                <Switch>
                    {
                        <Redirect exact from="/" to="/dashboard" />
                    }
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/users" component={Users} />
                    <Route path="/schools" component={Schools} />
                    <Route path="/tweets" component={Tweets} />
                    <Route path="/transactions" component={Transactions} />
                    <Route path="/library" component={Library} />
                    <Redirect to="/dashboard" />
                </Switch>
                
                <CustomSnackbar />
                <CustomConfirm />
            </Suspense>
        );
    }
}