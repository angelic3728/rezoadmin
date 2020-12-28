import React, { Component } from 'react';

import {
    Fab,
    ListItem,
    List,
    ListItemText,
    ListItemAvatar,
    Avatar,
    ListItemSecondaryAction,
    IconButton,
    Typography
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import firebase, { storageRef } from '../../../services/firebase';
import VideoForm from '../videoUpload/VideoForm';

import { CustomSnackbar, customConfirm, customConfirmClose } from '../../../services';

class IntroVideoUpload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Video List
            videosList: [],
            hoveredVideoKey: '',

            // Edit Video Modal
            addModalOpenState: false,

            // Edit Video Data
            modalInitialValues: {
                key: '',
                name: '',
                description: '',
                video: '',
                thumbnail: ''
            }
        };
    }

    // handle hover video
    handleHoverVideo = (key) => {
        this.setState({
            hoveredVideoKey: key
        });
    }

    // Toggle Add Modal Open
    toggleAddModalOpen = (state) => {
        this.setState({
            addModalOpenState: state
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
                video: '',
                thumbnail: ''
            }
        }, () => {
            self.toggleAddModalOpen(true);
        });
    }

    // handleDeleteVideo
    handleDeleteVideo = (videoKey) => {
        const self = this;
        customConfirm({
            title: 'Do you really wanna delete this video ?',
            okLabel: 'Delete',
            autoClose: false
        }, (dialogId) => {
            self.handleConfirmDeleteVideo(videoKey, dialogId);
        });
    }

    // handleConfirmDeleteVideo
    handleConfirmDeleteVideo = (videoKey, dialogId) => {
        const self = this;
        firebase.database().ref('videos/' + videoKey).once('value')
            .then((snapshot) => {
                const video = snapshot.val().video;
                if (video) {
                    self.handleDeleteVideoOnServer(video, () => {
                        firebase.database().ref('videos/' + videoKey).remove();
    
                        CustomSnackbar.success('Successfully deleted a video.');
                        customConfirmClose(dialogId);
                    });
                } else {
                    firebase.database().ref('videos/' + videoKey).remove();
                    CustomSnackbar.success('Successfully deleted a video.');
                    customConfirmClose(dialogId);
                }
            });
    }

    // handleDeleteVideo
    handleDeleteVideoOnServer = (video, callback) => {
        // Create a reference to the file to delete
        storageRef.child(video)
            .delete().then(function () {
                // File deleted successfully
                if (callback) {
                    callback();
                }
            }).catch(function (error) {
                // Uh-oh, an error occurred!
            });
    }

    // handleEditVideo
    handleEditVideo = (key) => {
        const self = this;
        firebase.database().ref('videos/' + key).once('value')
            .then((snapshot) => {
                const videoData = snapshot.val();
                self.setState({
                    modalInitialValues: {
                        key,
                        ...videoData
                    }
                }, () => {
                    self.toggleAddModalOpen(true);
                })
            });
    }

    // Get Formatted File Size
    getReadableFileSizeString = (fileSizeInBytes) => {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);

        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };

    componentDidMount() {
        const self = this;
        this.videosRef = firebase.database().ref('videos').orderByChild('courceKey').equalTo("");
        this.videosRef.on('value', function (snapshot) {
            let videos = [];

            snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().videoType === 'intro') {
                    videos.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                }
            });
            self.setState({
                videosList: videos
            });
        });
    }

    render() {
        const { handleEditVideo, handleDeleteVideo } = this;
        return (
            <>
                <div className="kt-portlet kt-portlet--height-fluid">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title">Videos ({this.state.videosList.length})</h3>
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
                            {this.state.videosList.length === 0 &&
                                "There aren't any videos yet."
                            }
                            <List>
                                {this.state.videosList.map(value => {
                                    return (
                                        <ListItem key={value.key} button
                                            alignItems="flex-start"
                                            onMouseOver={this.handleHoverVideo.bind(this, value.key)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt={`Video ${value.key}`}
                                                    src={value.thumbnail}
                                                    className="mr-3"
                                                    style={{
                                                        borderRadius: '0px',
                                                        width: '140px',
                                                        height: '80px',
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
                                                    <>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textPrimary"
                                                            className="d-block"
                                                            style={{ textOverflow: 'ellipsis', overflow: "hidden" }}
                                                        >{value.description}</Typography>

                                                        <Typography
                                                            component="span"
                                                            className="d-block mt-2"
                                                        >
                                                            {
                                                                `Size: ${this.getReadableFileSizeString(value.videoSize)}  Play: ${value.playCount}  Download: ${value.downloadCount}`
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            component="span"
                                                            className="d-block mt-2"
                                                        > Uploader: {value.uploader.email} </Typography>
                                                    </>
                                                }
                                            />

                                            <ListItemSecondaryAction style={{ right: 0 }}>

                                                <IconButton aria-label="Edit"
                                                    onClick={handleEditVideo.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredVideoKey === value.key ? 'inline-block' : 'none') }}>
                                                    <EditIcon fontSize="default" />
                                                </IconButton>

                                                <IconButton aria-label="Delete"
                                                    onClick={handleDeleteVideo.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredVideoKey === value.key ? 'inline-block' : 'none') }}>
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

                {/* Add Video Modal */}
                <VideoForm
                    open={this.state.addModalOpenState}
                    onClose={this.toggleAddModalOpen.bind(this, false)}
                    courceKey=""
                    modalInitialValues={this.state.modalInitialValues}
                    videoType="intro" />
            </>
        )
    }
}

export default IntroVideoUpload;