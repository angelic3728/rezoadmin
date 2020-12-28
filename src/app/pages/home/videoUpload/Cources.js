import React, { Component } from 'react';
import { Formik } from "formik";
import { connect } from 'react-redux';

import {
    Button,
    Divider,
    Fab,
    ListItem,
    List,
    ListItemText,
    ListItemAvatar,
    Avatar,
    ListItemSecondaryAction,
    Modal,
    IconButton,
    TextField,
    Typography
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import BackupIcon from '@material-ui/icons/Backup';
import SaveIcon from '@material-ui/icons/Save';

import firebase, { storageRef } from '../../../services/firebase';

import { CustomSnackbar, customConfirm, customConfirmClose } from '../../../services';

import {
    SET_COURCE_INFORMATION
} from './constants';

class Cources extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Video List
            hoveredCourceKey: '',

            // Edit Video Modal
            addModalOpenState: false,

            // Edit Video Data
            modalInitialValues: {
                key: '',
                name: '',
                description: '',
                thumbnail: '',
                thumbnailUrl: ''
            }
        };
    }

    // handle hover cource
    handleHoverCource = (key) => {
        this.setState({
            hoveredCourceKey: key
        });
    }

    // Toggle Add Modal Open
    toggleAddModalOpen = (state) => {
        const self = this;

        this.setState({
            addModalOpenState: state
        }, () => {
            if (state === true) {
                setTimeout(() => {
                    if (self.courceNameInput) {
                        self.courceNameInput.focus();
                    }
                }, 200)
            }
        });
    }

    // openAddModal
    openAddModal = () => {
        const self = this;
        this.setState({
            modalInitialValues: {
                key: '',
                name: '',
                description: '',
                thumbnail: '',
                thumbnailUrl: ''
            }
        }, () => {
            self.toggleAddModalOpen(true);
        });
    }

    // handleDeleteCource
    handleDeleteCource = (courceKey) => {
        const self = this;
        customConfirm({
            title: "Do you really wanna delete this cource ?",
            content: "It's videos will be delete too.",
            okLabel: "Delete",
            autoClose: false
        }, (dialogId) => {
            self.handleConfirmDeleteCource(courceKey, dialogId);
        });
    }

    // handleConfirmDeleteCource
    handleConfirmDeleteCource = (courceKey, dialogId) => {
        const self = this;
        firebase.database().ref('categories/' + this.props.selectedCategoryKey + '/cources/' + courceKey).once('value')
            .then((snapshot) => {
                const thumbnail = snapshot.val().thumbnail;
                self.handleDeleteThumbnail(thumbnail, () => {
                    firebase.database().ref('categories/' + this.props.selectedCategoryKey + '/cources/' + courceKey).remove();

                    CustomSnackbar.success('Successfully deleted a cource.');
                    customConfirmClose(dialogId);
                });
            });
    }

    // handleDeleteThumbnail
    handleDeleteThumbnail = (thumbnail, callback) => {
        // Create a reference to the file to delete
        storageRef.child(thumbnail)
            .delete().then(function () {
                // File deleted successfully
                if (callback) {
                    callback();
                }
            }).catch(function (error) {
                // Uh-oh, an error occurred!
            });
    }

    // handleEditCource
    handleEditCource = (key) => {
        const self = this;
        firebase.database().ref('categories/' + this.props.selectedCategoryKey + '/cources/' + key).once('value')
            .then((snapshot) => {
                const courceData = snapshot.val();
                self.setState({
                    modalInitialValues: {
                        key,
                        ...courceData
                    }
                }, () => {
                    self.toggleAddModalOpen(true);
                })
            });
    }

    // SubmitCourceData
    submitCourceData = (key, courceData) => {
        if (key) { // update
            firebase.database().ref('categories/' + this.props.selectedCategoryKey + '/cources/' + key).update(courceData);
        } else { // add
            // Get a key for a new Post.
            var newCourceKey = firebase.database().ref().child('categories/' + this.props.selectedCategoryKey + '/cources').push().key;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['categories/' + this.props.selectedCategoryKey + '/cources/' + newCourceKey] = courceData;

            firebase.database().ref().update(updates);
        }
    }

    // selectCourceItem
    selectCourceItem = (courceKey) => {
        var self = this;

        if (!courceKey) return;
        this.videosRef = firebase.database().ref('videos').orderByChild('courceKey').equalTo(courceKey);
        this.videosRef.on('value', function (snapshot) {
            let videos = [];

            snapshot.forEach(function (childSnapshot) {
                videos.push({
                    key: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            self.props.setSelectedCourceInfo(courceKey, videos);
        });
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (this.props.selectedCourceKey !== nextProps.selectedCourceKey) {
            this.selectCourceItem(nextProps.selectedCourceKey);
        }
    }

    render() {
        const { toggleAddModalOpen, handleEditCource, handleDeleteCource, submitCourceData, handleDeleteThumbnail, state: { modalInitialValues } } = this;
        return (
            <>
                <div className="kt-portlet kt-portlet--height-fluid">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title">Cources ({this.props.courcesList.length})</h3>
                        </div>

                        <div className="kt-portlet__head-label">
                            <Fab
                                color="primary"
                                aria-label="Add"
                                size="small"
                                onClick={this.openAddModal.bind(this)}
                            >
                                <AddIcon />
                            </Fab>
                        </div>
                    </div>
                    <div className="kt-portlet__body pr-3 pl-3">
                        <div className="kt-widget4">
                            {this.props.courcesList.length === 0 &&
                                "There aren't any cources yet."
                            }
                            <List>
                                {this.props.courcesList.map(value => {
                                    return (
                                        <ListItem key={value.key} button
                                            alignItems="flex-start"
                                            style={{ borderLeft: (value.status ? "solid 3px" : 'none') }}
                                            onClick={this.selectCourceItem.bind(this, value.key)}
                                            onMouseOver={this.handleHoverCource.bind(this, value.key)}
                                            selected={this.props.selectedCourceKey === value.key}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt={`Cource ${value.key}`}
                                                    src={value.thumbnailUrl}
                                                    className="mr-3"
                                                    style={{
                                                        borderRadius: '0px',
                                                        width: '130px',
                                                        height: '75px',
                                                        border: "solid 1px #c7c7c7"
                                                    }}
                                                />
                                            </ListItemAvatar>

                                            <ListItemText
                                                id={value.key}
                                                primary={
                                                    <Typography
                                                        component="span"
                                                        variant="body1"
                                                        className="d-block"
                                                        style={{ textOverflow: 'ellipsis', overflow: "hidden" }}
                                                    >{value.name}</Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textPrimary"
                                                        className="d-block"
                                                        style={{ textOverflow: 'ellipsis', overflow: "hidden" }}
                                                    >{value.description}</Typography>
                                                }
                                            />

                                            <ListItemSecondaryAction style={{ right: 0 }}>

                                                <IconButton aria-label="Edit"
                                                    onClick={handleEditCource.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredCourceKey === value.key ? 'inline-block' : 'none') }}>
                                                    <EditIcon fontSize="default" />
                                                </IconButton>

                                                <IconButton aria-label="Delete"
                                                    onClick={handleDeleteCource.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredCourceKey === value.key ? 'inline-block' : 'none') }}>
                                                    <DeleteIcon fontSize="default" />
                                                </IconButton>

                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </div>
                    </div>
                </div>

                {/* Add Category Modal */}
                <Modal
                    aria-labelledby="add-modal-title"
                    aria-describedby="add-modal-description"
                    open={this.state.addModalOpenState}
                    onClose={this.toggleAddModalOpen.bind(this, false)}>

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
                            Add A Cource
                        </Typography>

                        <Formik
                            initialValues={{
                                key: this.state.modalInitialValues.key,
                                courceName: this.state.modalInitialValues.name,
                                courceDesc: this.state.modalInitialValues.description,
                                courceThumbnail: ""
                            }}

                            validate={values => {
                                const errors = {};

                                if (!values.courceName) {
                                    errors.courceName = "Please input Cource Name";
                                }

                                if (!values.courceDesc) {
                                    errors.courceDesc = "Please input Cource Description";
                                }
                                return errors;
                            }}

                            onSubmit={(values, { setStatus, setSubmitting }) => {
                                const file = document.getElementById('courceThumbnail').files[0];

                                if (file) {
                                    const thumbnail = 'cources/' + new Date().getTime() + '.' + file.name.split('.').pop();
                                    const courceThumbnailRef = storageRef.child(thumbnail);

                                    var uploadTask = courceThumbnailRef.put(file, { contentType: file.type });
                                    // Register three observers:
                                    // 1. 'state_changed' observer, called any time the state changes
                                    // 2. Error observer, called on failure
                                    // 3. Completion observer, called on successful completion
                                    uploadTask.on('state_changed', function (snapshot) {
                                        // Observe state change events such as progress, pause, and resume
                                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                        // var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                        switch (snapshot.state) {
                                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                                break;
                                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                                break;
                                            default:
                                                break;
                                        }
                                    }, function (error) {
                                        // Handle unsuccessful uploads
                                    }, function () {
                                        // Handle successful uploads on complete
                                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                                        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                                            submitCourceData(values.key, {
                                                name: values.courceName,
                                                description: values.courceDesc,
                                                thumbnail: thumbnail,
                                                thumbnailUrl: downloadURL
                                            });

                                            setSubmitting(false);
                                            CustomSnackbar.success('Successfully saved a cource.');
                                            toggleAddModalOpen(false);

                                            if (values.key) {
                                                handleDeleteThumbnail(modalInitialValues.thumbnail);
                                            }
                                        });
                                    });
                                } else {
                                    submitCourceData(values.key, {
                                        name: values.courceName,
                                        description: values.courceDesc
                                    });

                                    setSubmitting(false);
                                    CustomSnackbar.success('Successfully saved a cource.');
                                    toggleAddModalOpen(false);
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
                                            id="courceName"
                                            label="Name"
                                            margin="normal"
                                            variant="outlined"
                                            inputRef={input => this.courceNameInput = input}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.courceName}
                                            helperText={touched.courceName && errors.courceName}
                                            error={Boolean(touched.courceName && errors.courceName)}
                                        />

                                        <TextField
                                            id="courceDesc"
                                            label="Description"
                                            margin="normal"
                                            variant="outlined"
                                            multiline
                                            rows="3"
                                            rowsMax="5"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.courceDesc}
                                            helperText={touched.courceDesc && errors.courceDesc}
                                            error={Boolean(touched.courceDesc && errors.courceDesc)}
                                        />

                                        <br />
                                        <label htmlFor="courceThumbnail">
                                            <Button color="primary" raised="true" component="span" variant="contained" size="large">
                                                <BackupIcon className="pr-2" />
                                                Upload Cource Thumbnail
                                            </Button>
                                            <br />
                                            <input type="file" id="courceThumbnail" name="courceThumbnail" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} />
                                        </label>
                                    </form>
                                )}
                        </Formik>
                    </div>
                </Modal>
            </>
        )
    }
}

function mapStateToProps(state) {
    return {
        selectedCategoryKey: state.videoUpload.selectedCategoryKey,
        selectedCourceKey: state.videoUpload.selectedCourceKey,
        courcesList: state.videoUpload.currentCources
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSelectedCourceInfo: (courceKey, videos) => {
            dispatch({
                type: SET_COURCE_INFORMATION,
                payload: {
                    courceKey,
                    videos
                }
            });
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Cources);