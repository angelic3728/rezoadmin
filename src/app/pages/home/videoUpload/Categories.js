import React, { Component } from 'react';
import { Formik } from "formik";
import { connect } from 'react-redux';

import {
    Button,
    Divider,
    Fab,
    FormControlLabel,
    ListItem,
    List,
    ListItemText,
    ListItemAvatar,
    Avatar,
    ListItemSecondaryAction,
    Modal,
    IconButton,
    Switch,
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
    SET_CATEGORY_INFORMATION
} from './constants';


class Categories extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Category List
            categoriesList: [],

            hoveredCategoryKey: '',

            // Edit Category Modal
            addModalOpenState: false,

            // Edit Category Data
            modalInitialValues: {
                name: '',
                description: '',
                status: false,
                thumbnail: '',
                thumbnailUrl: ''
            }
        };

        this.categoriesRef = null;
    }

    // handle hover category
    handleHoverCategory = (key) => {
        this.setState({
            hoveredCategoryKey: key
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
                    self.categoryNameInput.focus();
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
                status: false,
                thumbnail: '',
                thumbnailUrl: ''
            }
        }, () => {
            self.toggleAddModalOpen(true);
        });
    }

    // handleDeleteCategory
    handleDeleteCategory = (categoryKey) => {
        const self = this;
        customConfirm({
            title: "Do you really wanna delete this category ?",
            content: "It's cources and videos will be delete too.",
            okLabel: "Delete",
            autoClose: false
        }, (dialogId) => {
            self.handleConfirmDeleteCategory(categoryKey, dialogId);
        });
    }

    // handleConfirmDeleteCateg ory
    handleConfirmDeleteCategory = (categoryKey, dialogId) => {
        const self = this;
        firebase.database().ref('categories/' + categoryKey).once('value')
            .then((snapshot) => {
                const thumbnail = snapshot.val().thumbnail;
                self.handleDeleteThumbnail(thumbnail, () => {
                    firebase.database().ref('categories/' + categoryKey).remove();
                    CustomSnackbar.success('Successfully saved a video.');
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

    // handleEditCategory
    handleEditCategory = (key) => {
        const self = this;
        firebase.database().ref('categories/' + key).once('value')
            .then((snapshot) => {
                const categoryData = snapshot.val();
                self.setState({
                    modalInitialValues: {
                        key,
                        ...categoryData
                    }
                }, () => {
                    self.toggleAddModalOpen(true);
                })
            });
    }

    // SubmitCategoryData
    submitCategoryData = (key, category) => {
        if (key) { // update
            firebase.database().ref('categories/' + key).update(category);
        } else { // add
            // Get a key for a new Post.
            var newCategoryKey = firebase.database().ref().child('categories').push().key;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/categories/' + newCategoryKey] = category;

            firebase.database().ref().update(updates);
        }
    }

    // selectCategoryItem
    selectCategoryItem = (categoryKey) => {
        var self = this;
        this.courcesRef = firebase.database().ref('categories/' + categoryKey + '/cources');
        this.courcesRef.on('value', function (snapshot) {
            let cources = [];
            snapshot.forEach(function (childSnapshot) {
                cources.push({
                    key: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            self.props.setSelectedCategoryInfo(categoryKey, cources);
        });
    }

    componentDidMount() {
        const self = this;
        this.categoriesRef = firebase.database().ref('categories').orderByChild('status');
        this.categoriesRef.on('value', function (snapshot) {
            let categories = [];
            snapshot.forEach(function (childSnapshot) {
                categories.push({
                    key: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            self.setState({
                categoriesList: categories.reverse()
            }, () => {
                if (!self.props.selectedCategoryKey) {
                    self.selectCategoryItem(self.state.categoriesList[0].key);
                }
            });
        });
    }

    componentWillUnmount() {
        this.categoriesRef.off();
    }

    render() {
        const { toggleAddModalOpen, handleEditCategory, handleDeleteCategory, submitCategoryData, handleDeleteThumbnail, state: { modalInitialValues } } = this;
        return (
            <>
                <div className="kt-portlet kt-portlet--height-fluid">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title">Categories ({this.state.categoriesList.length})</h3>
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
                            <List>
                                {this.state.categoriesList.map(value => {
                                    return (
                                        <ListItem key={value.key} button
                                            alignItems="flex-start"
                                            style={{ borderLeft: (value.status ? "solid 3px" : 'none') }}
                                            onClick={this.selectCategoryItem.bind(this, value.key)}
                                            onMouseOver={this.handleHoverCategory.bind(this, value.key)}
                                            selected={this.props.selectedCategoryKey === value.key}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt={`Avatar n°${value + 1}`}
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
                                                    onClick={handleEditCategory.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredCategoryKey === value.key ? 'inline-block' : 'none') }}>
                                                    <EditIcon fontSize="default" />
                                                </IconButton>

                                                <IconButton aria-label="Delete"
                                                    onClick={handleDeleteCategory.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredCategoryKey === value.key ? 'inline-block' : 'none') }}>
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
                            Add A Category
                        </Typography>

                        <Formik
                            initialValues={{
                                key: this.state.modalInitialValues.key,
                                categoryName: this.state.modalInitialValues.name,
                                categoryDesc: this.state.modalInitialValues.description,
                                categoryStatus: this.state.modalInitialValues.status,
                                categoryThumbnail: ""
                            }}

                            validate={values => {
                                const errors = {};

                                if (!values.categoryName) {
                                    errors.categoryName = "Please input Category Name";
                                }

                                if (!values.categoryDesc) {
                                    errors.categoryDesc = "Please input Category Description";
                                }
                                return errors;
                            }}

                            onSubmit={(values, { setStatus, setSubmitting }) => {
                                const file = document.getElementById('categoryThumbnail').files[0];

                                if (file) {
                                    const thumbnail = 'categories/' + new Date().getTime() + '.' + file.name.split('.').pop();
                                    const categoryThumbnailRef = storageRef.child(thumbnail);

                                    var uploadTask = categoryThumbnailRef.put(file, { contentType: file.type });
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
                                            submitCategoryData(values.key, {
                                                name: values.categoryName,
                                                description: values.categoryDesc,
                                                status: values.categoryStatus,
                                                thumbnail: thumbnail,
                                                thumbnailUrl: downloadURL
                                            });

                                            setSubmitting(false);
                                            CustomSnackbar.success('Successfully saved a category.');
                                            toggleAddModalOpen(false);

                                            if (values.key) {
                                                handleDeleteThumbnail(modalInitialValues.thumbnail);
                                            }
                                        });
                                    });
                                } else {
                                    submitCategoryData(values.key, {
                                        name: values.categoryName,
                                        description: values.categoryDesc,
                                        status: values.categoryStatus
                                    });

                                    setSubmitting(false);
                                    CustomSnackbar.success('Successfully saved a category.');
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
                                            id="categoryName"
                                            label="Name"
                                            margin="normal"
                                            variant="outlined"
                                            inputRef={input => this.categoryNameInput = input}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.categoryName}
                                            helperText={touched.categoryName && errors.categoryName}
                                            error={Boolean(touched.categoryName && errors.categoryName)}
                                        />

                                        <TextField
                                            id="categoryDesc"
                                            label="Description"
                                            margin="normal"
                                            variant="outlined"
                                            multiline
                                            rows="3"
                                            rowsMax="5"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.categoryDesc}
                                            helperText={touched.categoryDesc && errors.categoryDesc}
                                            error={Boolean(touched.categoryDesc && errors.categoryDesc)}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    id="categoryStatus"
                                                    checked={values.categoryStatus}
                                                    onChange={handleChange}
                                                />
                                            }
                                            label="Status"
                                        />

                                        <br />
                                        <label htmlFor="categoryThumbnail">
                                            <Button color="primary" raised="true" component="span" variant="contained" size="large">
                                                <BackupIcon className="pr-2" />
                                                Upload Category Thumbnail
                                            </Button>
                                            <br />
                                            <input type="file" id="categoryThumbnail" name="categoryThumbnail" accept="image/jpeg,image/jpg,image/png," style={{ display: 'none' }} />
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
        selectedCategoryKey: state.videoUpload.selectedCategoryKey
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSelectedCategoryInfo: (categoryKey, cources) => {
            dispatch({
                type: SET_CATEGORY_INFORMATION,
                payload: {
                    categoryKey,
                    cources
                }
            });
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories);