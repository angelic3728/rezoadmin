import React from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { FormattedMessage, injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import * as auth from "../../store/ducks/auth.duck";
import firebase from '../../services/firebase';

function Registration(props) {
    const { intl } = props;

    return (
        <div className="kt-login__body">
            <div className="kt-login__form">
                <div className="kt-login__title">
                    <h3>
                        <FormattedMessage id="AUTH.REGISTER.TITLE" />
                    </h3>
                </div>

                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                        confirmPassword: ""
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

                        if (!values.confirmPassword) {
                            errors.confirmPassword = intl.formatMessage({
                                id: "AUTH.VALIDATION.REQUIRED_FIELD"
                            });
                        } else if (values.password !== values.confirmPassword) {
                            errors.confirmPassword =
                                "Password and Confirm Password didn't match.";
                        }

                        return errors;
                    }}
                    onSubmit={(values, { setStatus, setSubmitting }) => {
                        try {
                            firebase
                                .auth()
                                .createUserWithEmailAndPassword(values.email, values.password)
                                .then(dataBeforeEmail => {
                                    firebase.auth().onAuthStateChanged(function (user) {
                                        user.sendEmailVerification();
                                    });
                                })
                                .then(dataAfterEmail => {
                                    firebase.auth().onAuthStateChanged(function (user) {
                                        if (user.emailVerified) {
                                            // Email is verified
                                            props.register('accessToken');
                                        } else {
                                            // Email is not verified
                                            setSubmitting(false);
                                            setStatus(
                                                intl.formatMessage({
                                                    id: "AUTH.VALIDATION.SENT_REGISTER_VERIFYCATION_EMAIL"
                                                })
                                            );
                                        }
                                    });
                                })
                                .catch(function (error) {
                                    setSubmitting(false);
                                    setStatus(
                                        intl.formatMessage({
                                            id: "AUTH.VALIDATION.SOMETHING_WRONG"
                                        })
                                    );
                                });
                        } catch (err) {
                            setSubmitting(false);
                            setStatus(
                                intl.formatMessage({
                                    id: "AUTH.VALIDATION.SOMETHING_WRONG"
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
                            <form onSubmit={handleSubmit} noValidate autoComplete="off">
                                {status && (
                                    <div role="alert" className="alert alert-info">
                                        <div className="alert-text">{status}</div>
                                    </div>
                                )}

                                <div className="form-group mb-0">
                                    <TextField
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

                                <div className="form-group mb-0">
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

                                <div className="form-group">
                                    <TextField
                                        type="password"
                                        margin="normal"
                                        label="Confirm Password"
                                        className="kt-width-full"
                                        name="confirmPassword"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.confirmPassword}
                                        helperText={touched.confirmPassword && errors.confirmPassword}
                                        error={Boolean(
                                            touched.confirmPassword && errors.confirmPassword
                                        )}
                                    />
                                </div>

                                <div className="kt-login__actions">
                                    <Link
                                        to="/auth/forgot-password"
                                        className="kt-link kt-login__link-forgot"
                                    >
                                        <FormattedMessage id="AUTH.GENERAL.FORGOT_BUTTON" />
                                    </Link>

                                    <Link to="/auth">
                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                    </Link>

                                    <button
                                        disabled={isSubmitting}
                                        className="btn btn-primary btn-elevate kt-login__btn-primary"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                </Formik>
            </div>
        </div>
    );
}

export default injectIntl(
    connect(
        null,
        auth.actions
    )(Registration)
);
