import React, { Component } from "react";
// import * as auth from "../../store/ducks/auth.duck";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";
import firebase from '../../services/firebase';

class Logout extends Component {
    componentDidMount() {
        // this.props.logout();

        try {
            firebase
                .auth()
                .signOut()
                .then(() => {
                    // dispatch({ type: SIGNOUT_SUCCESS });
                })
                .catch(() => {
                    // dispatch({
                    //     type: SIGNOUT_ERROR,
                    //     payload: "...some error message for the user..."
                    // });
                });
        } catch (err) {
            // dispatch({
            //     type: SIGNOUT_ERROR,
            //     payload: "...some error message for the user..."
            // });
        }
    }

    render() {
        const { isAuthorized } = this.props;

        return isAuthorized ? <LayoutSplashScreen /> : <Redirect to="/auth" />;
    }
}

export default connect(
    ({ auth, firebaseReducer }) => ({
        // hasAuthToken: Boolean(auth.authToken),
        isAuthorized: firebaseReducer.auth.isLoaded && !firebaseReducer.auth.isEmpty,
    })
)(Logout);
