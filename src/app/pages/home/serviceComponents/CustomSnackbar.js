import React, { Component } from 'react';
import { connect } from 'react-redux';
import clsx from "clsx";

import {
    Snackbar,
    IconButton,
    SnackbarContent
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { amber, green } from "@material-ui/core/colors";

import CloseIcon from "@material-ui/icons/Close";
import WarningIcon from "@material-ui/icons/Warning";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import {
    REMOVE_CUSTOM_SNACK_BAR
} from '../../../store/reducers/constants';


const useStyles = makeStyles(theme => ({
    success: {
        backgroundColor: green[600]
    },
    error: {
        backgroundColor: theme.palette.error.dark
    },
    info: {
        backgroundColor: theme.palette.primary.main
    },
    warning: {
        backgroundColor: amber[700]
    },
    icon: {
        fontSize: 20
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1)
    },
    message: {
        display: "flex",
        alignItems: "center"
    }
}));

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon
};


function MySnackbarContentWrapper(props) {
    const classes = useStyles();
    const { className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={clsx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={clsx(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>
            ]}
            {...other}
        />
    );
}

class CustomSnackbar extends Component {
    render() {
        return (
            <>
                {this.props.snackBarContents.map((value, index) => {
                    return (
                        <Snackbar
                            key={value.key}
                            anchorOrigin={value.anchorOrigin}
                            open={true}
                            onClose={this.props.removeSnackContent.bind(this, value.key)}
                            autoHideDuration={value.autoHideDuration}
                            style={{marginTop: index * 65 + 'px'}}
                            >
                            <MySnackbarContentWrapper
                                onClose={this.props.removeSnackContent.bind(this, value.key)}
                                variant={value.variant}
                                message={value.message}
                            />
                        </Snackbar>
                    );
                })}
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    snackBarContents: state.customSnackBar.snackBarcontents
});

const mapDispatchToProps = (dispatch) => ({
    removeSnackContent: (key) => {
        dispatch({
            type: REMOVE_CUSTOM_SNACK_BAR,
            payload: key
        });
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomSnackbar)
