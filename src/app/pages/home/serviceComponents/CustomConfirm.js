import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText
} from "@material-ui/core";

import {
    REMOVE_CONFIRM_DIALOG
} from '../../../store/reducers/constants';

export class CustomConfirm extends Component {
    render() {
        return (
            <>
                {this.props.dialogList.map(value => {
                    return (
                        <Dialog
                            key={value.key}
                            open={true}
                            fullWidth={Boolean(value.width)}
                            maxWidth={value.width || 'sm'}
                            onClose={this.props.closeDialog.bind(this, value.key)}
                            aria-labelledby="confirm-dialog"
                            aria-describedby="confirm-category-delete-dialog"
                        >
                            {value.title &&
                                <DialogTitle id="confirm-delete-dialog-dialog-title" className="text-center">
                                    {value.title}
                                </DialogTitle>
                            }

                            {value.content &&
                                <DialogContent>
                                    <DialogContentText id="confirm-delete-dialog-dialog-description">
                                        {value.content}
                                    </DialogContentText>
                                </DialogContent>
                            }

                            <DialogActions>
                                {typeof (value.cancelLabel) === 'string' &&
                                    <Button onClick={this.props.closeDialog.bind(this, value.key)} color="primary">
                                        {value.cancelLabel}
                                    </Button>
                                }
                                {typeof (value.cancelLabel) !== 'string' && value.cancelLabel}

                                {typeof (value.okLabel) === 'string' &&
                                    <Button onClick={this.props.callbackFunc.bind(this, value.callback, value.key, value.autoClose)} color="primary" autoFocus>
                                        {value.okLabel}
                                    </Button>
                                }
                                {typeof (value.okLabel) !== 'string' && value.okLabel}
                            </DialogActions>
                        </Dialog>
                    );
                })}
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    dialogList: state.customConfirm.dialogList
});

const mapDispatchToProps = (dispatch) => ({
    closeDialog: (key) => {
        dispatch({
            type: REMOVE_CONFIRM_DIALOG,
            payload: key
        });
    },

    callbackFunc: (callback, dialogKey, autoClose) => {
        if (autoClose) {
            dispatch((dispatch) => {
                dispatch({
                    type: REMOVE_CONFIRM_DIALOG,
                    payload: dialogKey
                });
                return Promise.resolve();
            }).then(() => {
                callback(dialogKey);
            });
        } else {
            callback(dialogKey);
        }
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomConfirm);