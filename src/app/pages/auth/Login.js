import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import clsx from "clsx";
import * as auth from "../../store/ducks/auth.duck";
import firebase from '../../services/firebase';

function Login(props) {
    const { intl } = props;
    const [loading, setLoading] = useState(false);
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        paddingRight: "2.5rem"
    });

    const enableLoading = () => {
        setLoading(true);
        setLoadingButtonStyle({ paddingRight: "3.5rem" });
    };

    const disableLoading = () => {
        setLoading(false);
        setLoadingButtonStyle({ paddingRight: "2.5rem" });
    };

    return (
        <>
            <div className="kt-login__body">
                <div className="kt-login__form">
                    <div className="kt-login__title">
                        <h3>
                            <FormattedMessage id="AUTH.LOGIN.TITLE" />
                        </h3>
                    </div>

                    <Formik
                        initialValues={{
                            email: "admin@gmail.com",
                            password: "12345678"
                            // email: "voidpom@gmail.com",
                            // password: "gategate"
                        }}
                        validate={values => {
                            const errors = {};

                            if (!values.email) {
                                errors.email = intl.formatMessage({
                                    id: "AUTH.VALIDATION.REQUIRED_FIELD"
                                });
                            } else if (
                                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                            ) {
                                errors.email = intl.formatMessage({
                                    id: "AUTH.VALIDATION.INVALID_FIELD"
                                });
                            }

                            if (!values.password) {
                                errors.password = intl.formatMessage({
                                    id: "AUTH.VALIDATION.REQUIRED_FIELD"
                                });
                            }

                            return errors;
                        }}
                        onSubmit={(values, { setStatus, setSubmitting }) => {
                            enableLoading();
                            try {
                                firebase
                                    .auth()
                                    .signInWithEmailAndPassword(values.email, values.password)
                                    .then((res) => {
                                        disableLoading();
                                        const { email, emailVerified, refreshToken } = res.user;
                                        console.log(res);
                                        firebase.auth().currentUser.getIdTokenResult().then(result => {
                                            let admin_id = result.claims.user_id;
                                            firebase.database().ref('users').child(admin_id).on('value', function (snapshot) {
                                                if (snapshot.val() != null) {
                                                    console.log(snapshot.val().type);
                                                    if (snapshot.val().type === "ADMIN") {
                                                        props.login({ email, emailVerified, refreshToken });
                                                    } else {
                                                        firebase.auth().signOut().then(() => { }).catch(() => { });
                                                    }
                                                } else {
                                                    firebase.auth().signOut().then(() => { }).catch(() => { });
                                                }
                                                // if (snapshot.numChildren() > 0) {
                                                //     snapshot.forEach(function (childSnapshot) {
                                                //         console.log(childSnapshot.val().email);
                                                //     });
                                                // }
                                            });
                                            // if (result.claims && (result.claims.role === "admin" || result.claims.role === 'instructor')) {
                                            //     props.login({ email, emailVerified, refreshToken, role: result.claims.role });
                                            // } else {
                                            //     firebase
                                            //         .auth()
                                            //         .signOut()
                                            //         .then(() => {})
                                            //         .catch(() => {});
                                            // }
                                        });
                                    })
                                    .catch((err) => {
                                        disableLoading();
                                        setSubmitting(false);
                                        setStatus(
                                            intl.formatMessage({
                                                id: "AUTH.VALIDATION.INVALID_LOGIN"
                                            })
                                        );
                                    });
                            } catch (err) {
                                setStatus(
                                    intl.formatMessage({
                                        id: "AUTH.VALIDATION.INVALID_LOGIN"
                                    })
                                );
                            }
                        }}
                    >
                        {({
                            values,
                            status,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting
                        }) => (
                                <form
                                    noValidate={true}
                                    autoComplete="off"
                                    className="kt-form"
                                    onSubmit={handleSubmit}
                                >
                                    {status ? (
                                        <div role="alert" className="alert alert-danger">
                                            <div className="alert-text">{status}</div>
                                        </div>
                                    ) : ('')}

                                    <div className="form-group">
                                        <TextField
                                            type="email"
                                            label="Email"
                                            margin="normal"
                                            className="kt-width-full"
                                            name="email"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.email}
                                            helperText={touched.email && errors.email}
                                            error={Boolean(touched.email && errors.email)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <TextField
                                            type="password"
                                            margin="normal"
                                            label="Password"
                                            className="kt-width-full"
                                            name="password"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.password}
                                            helperText={touched.password && errors.password}
                                            error={Boolean(touched.password && errors.password)}
                                        />
                                    </div>

                                    <div className="kt-login__actions">
                                        <Link
                                            to="/auth/forgot-password"
                                            className="kt-link kt-login__link-forgot"
                                        >
                                            <FormattedMessage id="AUTH.GENERAL.FORGOT_BUTTON" />
                                        </Link>

                                        <button
                                            id="kt_login_signin_submit"
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`btn btn-primary btn-elevate kt-login__btn-primary ${clsx(
                                                {
                                                    "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": loading
                                                }
                                            )}`}
                                            style={loadingButtonStyle}
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </form>
                            )}
                    </Formik>
                </div>
            </div>
        </>
    );
}

export default injectIntl(
    connect(
        null,
        auth.actions
    )(Login)
);
