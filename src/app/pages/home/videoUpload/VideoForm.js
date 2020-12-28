import React, { Component } from 'react';
import { Formik } from "formik";
import PropTypes from 'prop-types';
import axios from 'axios';

import {
    Button,
    Divider,
    Modal,
    TextField,
    Typography
} from "@material-ui/core";

import SaveIcon from '@material-ui/icons/Save';
import BackupIcon from '@material-ui/icons/Backup';

import firebase, { storageRef } from '../../../services/firebase';

import * as CustomSnackbar from '../../../services/customSnackbar';

export class VideoForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUploadingStatus: 0,
            uploadedVideoBlogData: '',
            uploadVideoType: 'upload',
            loadingOnlineVideoStatusProgress: 0,
            onlineVideoUrlValue: '',
            onlineVideoSize: 0,
            loadingOnlineVideoStatusFlag: false
        };
    }

    // SubmitVideoData
    submitVideoData = (key, videoData) => {
        if (key) { // update
            firebase.database().ref('videos/' + key).update(videoData);
        } else { // add
            // Get a key for a new Post.
            var newVideoKey = firebase.database().ref().child('videos').push().key;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            videoData['videoType'] = this.props.videoType;
            videoData['courceKey'] = this.props.courceKey;
            videoData['uploader'] = {
                email: firebase.auth().currentUser.email,
                uid: firebase.auth().currentUser.uid
            }
            videoData['playCount'] = 0;
            videoData['downloadCount'] = 0;
            videoData['uploadDate'] = firebase.database.ServerValue.TIMESTAMP;

            updates['videos/' + newVideoKey] = videoData;
            firebase.database().ref().update(updates);
        }
    }

    // handleDeleteVideo
    handleDeleteVideoOnServer = (video) => {
        // Create a reference to the file to delete
        storageRef.child(video)
            .delete().then(function () {
                // File deleted successfully
            }).catch(function (error) {
                // Uh-oh, an error occurred!
            });
    }

    // loadVideoFromUrl
    loadVideoFromUrl = () => {
        const self = this;

        if (!this.state.onlineVideoUrlValue || this.state.uploadVideoType !== 'url') return;

        this.setState({
            loadingOnlineVideoStatusFlag: true
        });

        axios({
            method: 'GET',
            url: this.state.onlineVideoUrlValue,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                this.setState({
                    loadingOnlineVideoStatusProgress: Math.round((progressEvent.loaded / progressEvent.total) * 1000) / 10
                });
            }
        })
            .then(response => {
                const video = document.getElementById('previewVideoEle');

                video.addEventListener('loadeddata', () => {
                    setTimeout(() => {
                        let canvas = document.getElementById('canvasForVideo');
                        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                        const imgSrc = canvas.toDataURL();
                        self.setState({
                            uploadedVideoBlogData: imgSrc,
                            loadingOnlineVideoStatusFlag: false,
                            onlineVideoSize: response.headers['content-length']
                        });
                    }, 3000);
                });

                video.preload = 'metadata';
                video.src = window.URL.createObjectURL(new Blob([response.data]));
                // Load video in Safari / IE11
                video.muted = true;
                video.playsInline = true;
                video.play();
            })
            .catch((error) => {
                self.setState({
                    loadingOnlineVideoStatusFlag: false
                });
                console.log('An error eccured', error);
            });
    }

    // handleVideoUrlChange
    handleVideoUrlChange = (event) => {
        const self = this;
        this.setState({
            onlineVideoUrlValue: event.target.value
        }, () => {
            self.loadVideoFromUrl();
        });
    }

    // toggleUploadVideoType
    toggleUploadVideoType = (type) => {
        const self = this;
        this.setState({
            uploadVideoType: type
        }, () => {
            if (self.state.uploadVideoType === 'url') {
                document.getElementById('videoSource').value = "";
                self.loadVideoFromUrl();
            }
        });
    }

    // handleUploadVideo
    handleUploadVideo = (event) => {
        event.persist()
        this.toggleUploadVideoType('upload');

        const self = this;
        const file = event.target.files[0];
        let fileReader = new FileReader();

        fileReader.onload = function () {
            var blob = new Blob([fileReader.result], { type: file.type });
            var url = URL.createObjectURL(blob);

            var video = document.getElementById('previewVideoEle');

            video.addEventListener('loadeddata', function () {
                var canvas = document.getElementById('canvasForVideo');
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                const imgSrc = canvas.toDataURL();
                self.setState({
                    uploadedVideoBlogData: imgSrc
                });
            });

            video.preload = 'metadata';
            video.src = url;
            // Load video in Safari / IE11
            video.muted = true;
            video.playsInline = true;
            video.play();
        };
        fileReader.readAsArrayBuffer(file);
    }

    // Draw Video Thumbnail with Canvas
    drawVideoThumbnail = (props) => {
        setTimeout(() => {
            let img = new Image();
            img.src = props.modalInitialValues.thumbnail;

            img.onload = function () {
                let canvas = document.getElementById('canvasForVideo');
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            if (this.videoNameInput) {
                this.videoNameInput.focus();
            }
        }, 300);
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (nextProps.open !== this.props.open && nextProps.open === true) {
            this.drawVideoThumbnail(nextProps);
        }

        if (nextProps.modalInitialValues.key) {
            nextState.uploadVideoType = nextProps.modalInitialValues.video ? 'upload' : 'url';
        }
    }

    componentDidMount() {
        this.drawVideoThumbnail(this.props);
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
                        Add A Video
                    </Typography>

                    <Formik
                        initialValues={{
                            key: this.props.modalInitialValues.key,
                            videoName: this.props.modalInitialValues.name,
                            videoDesc: this.props.modalInitialValues.description,
                            videoSource: "",
                            videoUrl: this.props.modalInitialValues.videoUrl
                        }}

                        validate={values => {
                            const errors = {};

                            if (!values.videoName) {
                                errors.videoName = "Please input Cource Name";
                            }

                            if (!values.videoDesc) {
                                errors.videoDesc = "Please input Cource Description";
                            }
                            return errors;
                        }}

                        onSubmit={(values, { setStatus, setSubmitting }) => {
                            const file = document.getElementById('videoSource').files[0];

                            if (file && self.state.uploadVideoType === 'upload') {
                                const videoSource = 'videos/' + new Date().getTime() + '.' + file.name.split('.').pop();
                                const videoSourceRef = storageRef.child(videoSource);

                                var uploadTask = videoSourceRef.put(file, { contentType: file.type });
                                // Register three observers:
                                // 1. 'state_changed' observer, called any time the state changes
                                // 2. Error observer, called on failure
                                // 3. Completion observer, called on successful completion
                                uploadTask.on('state_changed', function (snapshot) {
                                    // Observe state change events such as progress, pause, and resume
                                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    self.setState({
                                        currentUploadingStatus: Math.ceil(progress * 10) / 10
                                    });
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
                                        self.submitVideoData(values.key, {
                                            name: values.videoName,
                                            description: values.videoDesc,
                                            video: videoSource,
                                            videoUrl: downloadURL,
                                            videoSize: file.size,
                                            thumbnail: self.state.uploadedVideoBlogData
                                        });

                                        setSubmitting(false);
                                        CustomSnackbar.success('Successfully saved a video.');
                                        self.props.onClose();

                                        if (values.key) {
                                            self.handleDeleteVideoOnServer(self.props.modalInitialValues.video);
                                        }
                                    });
                                });
                                return;
                            } else if (self.state.uploadVideoType === 'url') {
                                if (self.state.loadingOnlineVideoStatusProgress === 100) {
                                    self.submitVideoData(values.key, {
                                        name: values.videoName,
                                        description: values.videoDesc,
                                        video: '',
                                        videoUrl: self.state.onlineVideoUrlValue,
                                        videoSize: self.state.onlineVideoSize,
                                        thumbnail: self.state.uploadedVideoBlogData
                                    });

                                    setSubmitting(false);
                                    CustomSnackbar.success('Successfully saved a video.');
                                    self.props.onClose();
                                } else {
                                    setSubmitting(false);
                                }
                                return;
                            } else {
                                if (values.key) {
                                    self.submitVideoData(values.key, {
                                        name: values.videoName,
                                        description: values.videoDesc
                                    });
                                    CustomSnackbar.success('Successfully saved a video.');
                                    self.props.onClose();
                                }

                                setSubmitting(false);
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
                                        {isSubmitting && (this.state.currentUploadingStatus + '%')}
                                        {!isSubmitting && "Save"}
                                    </Button>

                                    <Divider className="mt-3" />

                                    <TextField
                                        id="videoName"
                                        label="Name"
                                        margin="normal"
                                        variant="outlined"
                                        inputRef={input => this.videoNameInput = input}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.videoName}
                                        helperText={touched.videoName && errors.videoName}
                                        error={Boolean(touched.videoName && errors.videoName)}
                                    />

                                    <TextField
                                        id="videoDesc"
                                        label="Description"
                                        margin="normal"
                                        variant="outlined"
                                        multiline
                                        rows="3"
                                        rowsMax="5"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.videoDesc}
                                        helperText={touched.videoDesc && errors.videoDesc}
                                        error={Boolean(touched.videoDesc && errors.videoDesc)}
                                    />

                                    <br />
                                    <label htmlFor="videoSource">
                                        <Button color="primary" raised="true" component="span" variant="contained" size="large">
                                            <BackupIcon className="pr-2" />
                                            Upload A Video
                                        </Button>
                                        <br />
                                        <input type="file" id="videoSource" name="videoSource" accept="video/mp4,video/webm,video/ogg" style={{ display: 'none' }} onChange={this.handleUploadVideo} />
                                    </label>

                                    <Typography
                                        component="span"
                                        varient="body1"
                                        color="textPrimary"
                                        className="pl-2 pr-2"
                                    > OR </Typography>

                                    <Button color="primary" component="span" variant="contained" size="large" disabled={this.state.loadingOnlineVideoStatusFlag} onClick={this.toggleUploadVideoType.bind(this, 'url')}>
                                        {this.state.loadingOnlineVideoStatusFlag ? this.state.loadingOnlineVideoStatusProgress + '% Loaded' : 'Input Video URL'}
                                    </Button>

                                    {/* uploadVideoType */}
                                    <TextField
                                        id="videoUrl"
                                        label="Video Url"
                                        margin="normal"
                                        variant="outlined"
                                        className={this.state.uploadVideoType !== 'url' ? 'd-none' : ''}
                                        onBlur={handleBlur}
                                        onChange={this.handleVideoUrlChange}
                                        value={values.videoUrl}
                                        helperText={touched.videoUrl && errors.videoUrl}
                                        error={Boolean(touched.videoUrl && errors.videoUrl)}
                                    />

                                    {/* Canvas for uploaded Video */}
                                    <canvas width="356" height="200" style={{ border: "solid 2px gray" }} id="canvasForVideo"></canvas>
                                </form>
                            )}
                    </Formik>

                    {/* previewVideoEle */}
                    <video id="previewVideoEle" className="d-none"></video>
                </div>
            </Modal>
        )
    }
}

VideoForm.defaultProps = {
    videoType: 'normal'
};

VideoForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    modalInitialValues: PropTypes.object,
    courceKey: PropTypes.string,
    videoType: PropTypes.string
}

export default VideoForm;