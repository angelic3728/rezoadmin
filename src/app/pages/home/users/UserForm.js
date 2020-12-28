import React, { Component } from 'react';
import { Formik } from "formik";
import PropTypes from 'prop-types';

import {
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@material-ui/core";

import SaveIcon from '@material-ui/icons/Save';

import * as customSnackbar from '../../../services/customSnackbar';
import { instance } from '../../../services';

export class UserForm extends Component {
    focusEmailInput = () => {
        setTimeout(() => {
            if (this.emailInput) {
                this.emailInput.focus();
            }
        }, 300);
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (nextProps.open !== this.props.open && nextProps.open === true) {
            this.focusEmailInput();
        }
    }

    componentDidMount() {
        this.focusEmailInput();
    }

    render() {
        const self = this;
        return (
            <Modal
                aria-labelledby="add-modal-title"
                aria-describedby="add-modal-description"
                open={this.props.open}
                onClose={this.props.onClose}>

                <div className="p-4" style={{
                    position: "absolute",
                    width: 400,
                    backgroundColor: "white",
                    boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                    padding: "",
                    outline: "none",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <Typography variant="h6" id="modal-title">
                        Input User Info
                    </Typography>

                    <Formik
                        initialValues={{
                            uid: this.props.modalInitialValues.uid,
                            fullname: this.props.modalInitialValues.displayName,
                            email: this.props.modalInitialValues.email,
                            role: this.props.modalInitialValues.role,
                            password: '',
                            passwordConfirm: ''
                        }}

                        validate={values => {
                            const errors = {};

                            if (!values.fullname) {
                                errors.fullname = "Please input fullname";
                            }

                            if (!values.email) {
                                errors.email = "Please input User Email";
                            }

                            if (values.password && values.password !== values.passwordConfirm) {
                                errors.password = "Please input password again";
                            }
                            return errors;
                        }}

                        onSubmit={(values, { setStatus, setSubmitting }) => {
                            if (values.uid) {
                                instance.patch('users/' + values.uid, {
                                    email: values.email,
                                    displayName: values.fullname,
                                    role: values.role,
                                    password: values.password
                                }).then(res => {
                                    customSnackbar.success('Successfully updated user info.');
                                    setSubmitting(false);
                                    self.props.onClose();
                                });
                            } else {
                                if (!values.password) {
                                    setSubmitting(false);
                                    return;
                                }
                                instance.post('users', {
                                    email: values.email,
                                    displayName: values.fullname,
                                    role: values.role,
                                    password: values.password
                                }).then(res => {
                                    customSnackbar.success('Successfully Added A User');
                                    setSubmitting(false);
                                    self.props.onClose();
                                });
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


                                    <Button color="primary" variant="contained" size="large"
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{ position: 'absolute', top: '10px', right: '20px' }}
                                    >
                                        <SaveIcon className="mr-2" />
                                        Save
                                    </Button>

                                    <Divider className="mt-3" />

                                    <TextField
                                        id="email"
                                        label="Email"
                                        margin="normal"
                                        variant="outlined"
                                        inputRef={input => this.emailInput = input}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.email}
                                        helperText={touched.email && errors.email}
                                        error={Boolean(touched.email && errors.email)}
                                    />

                                    <TextField
                                        id="fullname"
                                        label="Full Name"
                                        margin="normal"
                                        variant="outlined"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.fullname}
                                        helperText={touched.fullname && errors.fullname}
                                        error={Boolean(touched.fullname && errors.fullname)}
                                    />

                                    <FormControl variant="outlined" margin="normal">
                                        <InputLabel ref={label => this.inputLabel = label} htmlFor="outlined-role-simple"> Role </InputLabel>
                                        <Select
                                            id="role"
                                            value={values.role}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    name="role"
                                                    id="outlined-role-simple"
                                                />
                                            }
                                        >
                                            <MenuItem value='Teacher'>Teacher</MenuItem>
                                            <MenuItem value='Student'>Student</MenuItem>
                                            <MenuItem value='Parent'>Parent</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        id="password"
                                        label="Password"
                                        margin="normal"
                                        variant="outlined"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.password}
                                        helperText={touched.password && errors.password}
                                        error={Boolean(touched.password && errors.password)}
                                    />

                                    <TextField
                                        id="passwordConfirm"
                                        label="Confirm Password"
                                        margin="normal"
                                        variant="outlined"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.passwordConfirm}
                                        helperText={touched.passwordConfirm && errors.passwordConfirm}
                                        error={Boolean(touched.password && errors.password)}
                                    />
                                </form>
                            )}
                    </Formik>
                </div>
            </Modal>
        )
    }
}

UserForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    modalInitialValues: PropTypes.object
}

export default UserForm;