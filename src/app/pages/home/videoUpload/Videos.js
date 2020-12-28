import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
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
import Rating from '@material-ui/lab/Rating';


import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CommentIcon from '@material-ui/icons/Comment';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import CheckIcon from '@material-ui/icons/Check';

import firebase, { storageRef } from '../../../services/firebase';
import moment from 'moment';
import VideoForm from './VideoForm';

import { CustomSnackbar, customConfirm, customConfirmClose } from '../../../services';

class Videos extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Video List
            hoveredVideoKey: '',

            // Edit Video Modal
            addModalOpenState: false,

            // Edit Video Data
            modalInitialValues: {
                key: '',
                name: '',
                description: '',
                video: '',
                thumbnail: '',
                videoUrl: ''
            },

            // Handle Comments Modal
            commentsModalOpenFlag: false,
            currentShowingComments: [],
            hoveredCommentKey: '',

            // Select Instructor Video Modal
            selectInstructorVideoModalOpenFlag: false,
            instructorVideoList: []
        };
    }

    // handle hover cource
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
            title: "Do you really wanna delete this video ?",
            okLabel: "Delete",
            autoClose: false
        }, (dialogId) => {
            self.handleConfirmDeleteVideo(videoKey, dialogId);
        });
    }

    // handleDeleteVideoDataOnServer
    handleDeleteVideoDataOnServer = (videoKey, dialogId) => {
        firebase.database().ref('videos/' + videoKey).remove();

        CustomSnackbar.success('Successfully deleted a video.');
        customConfirmClose(dialogId);
    }

    // handleConfirmDeleteVideo
    handleConfirmDeleteVideo = (videoKey, dialogId) => {
        const self = this;
        firebase.database().ref('videos/' + videoKey).once('value')
            .then((snapshot) => {
                const video = snapshot.val().video;

                if (video) {
                    self.handleDeleteVideoOnServer(video, self.handleDeleteVideoDataOnServer.bind(this, videoKey, dialogId));
                } else {
                    self.handleDeleteVideoDataOnServer(videoKey, dialogId);
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
                    },
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

    // handleViewComments
    handleViewComments = (videoKey) => {
        const self = this;
        this.videosRef = firebase.database().ref('videos/' + videoKey + '/comments');
        this.videosRef.on('value', function (snapshot) {
            let comments = [];

            snapshot.forEach(function (childSnapshot) {
                comments.push({
                    key: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            self.setState({
                currentShowingComments: comments,
                commentsModalOpenFlag: true
            });
        });
    }

    // toggle Comments Modal Open
    toggleCommentsModalOpen = (state) => {
        this.setState({
            commentsModalOpenFlag: state
        });
    }

    // handleHoverComment
    handleHoverComment = (commentKey) => {
        this.setState({
            hoveredCommentKey: commentKey
        });
    }

    // handleDeleteComment
    handleDeleteComment = (commentKey) => {
        customConfirm({
            title: "Do you really wanna delete this comment ?",
            okLabel: "Delete",
            autoClose: false
        }, (dialogId) => {
            this.handleConfirmDeleteComment(commentKey, dialogId);
        });
    }

    // handleConfirmDeleteComment
    handleConfirmDeleteComment = (commentKey, dialogId) => {
        firebase.database().ref('videos/' + this.state.hoveredVideoKey + '/comments/' + commentKey).remove();

        CustomSnackbar.success('Successfully deleted a comment.');
        customConfirmClose(dialogId);
    }

    // toggleSelectInstructorVideoModalOpen
    toggleSelectInstructorVideoModalOpen = (state) => {
        this.setState({
            selectInstructorVideoModalOpenFlag: state
        });
    }

    // selectInstructorVideo
    selectInstructorVideo = (videoKey) => {
        const self = this;
        firebase.database().ref('videos/' + videoKey).update({
            courceKey: self.props.selectedCourceKey
        });
    }

    // handleInstructorVideoHover
    handleInstructorVideoHover = (videoKey) => {
        this.setState({
            hoveredInstructorVideoKey: videoKey
        });
    }

    componentDidMount() {
        const self = this;
        this.instrucTorVideosRef = firebase.database().ref('videos').orderByChild('courceKey').equalTo("");
        this.instrucTorVideosRef.on('value', function (snapshot) {
            let videos = [];

            snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().videoType !== 'intro') {
                    videos.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                }
            });
            self.setState({
                instructorVideoList: videos
            })
        });
    }

    render() {
        const { handleEditVideo, handleDeleteVideo } = this;
        return (
            <>
                <div className="kt-portlet kt-portlet--height-fluid">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title">Videos ({this.props.videosList.length})</h3>
                        </div>

                        <div className="kt-portlet__head-label">
                            <Fab
                                color="primary"
                                aria-label="Select"
                                size="small"
                                className="mr-2"
                                onClick={this.toggleSelectInstructorVideoModalOpen.bind(this, true)}
                            >
                                <TouchAppIcon />
                            </Fab>

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
                            {this.props.videosList.length === 0 &&
                                "There aren't any videos yet."
                            }
                            <List>
                                {this.props.videosList.map(value => {
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

                                                <IconButton aria-label="View Comments"
                                                    onClick={this.handleViewComments.bind(this, value.key)}
                                                    style={{ display: (this.state.hoveredVideoKey === value.key ? 'inline-block' : 'none') }}>
                                                    <CommentIcon fontSize="default" />
                                                </IconButton>

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
                    courceKey={this.props.selectedCourceKey}
                    modalInitialValues={this.state.modalInitialValues} />

                {/* View Comments Modal */}
                <Dialog
                    scroll="paper"
                    aria-labelledby="scroll-dialog-title"
                    open={this.state.commentsModalOpenFlag}
                    onClose={this.toggleCommentsModalOpen.bind(this, false)}>

                    <DialogTitle id="scroll-dialog-title">View Comments ({this.state.currentShowingComments.length})</DialogTitle>

                    <DialogContent dividers={true} className="pl-0 pr-0">
                        <List>
                            {this.state.currentShowingComments.map(value => {
                                return (
                                    <ListItem key={value.key} button
                                        alignItems="flex-start"
                                        onMouseOver={this.handleHoverComment.bind(this, value.key)}
                                    >
                                        <ListItemAvatar className="mr-3">
                                            <Avatar
                                                alt={`Video ${value.key}`}
                                                src={value.thumbnail}
                                                className="mx-auto"
                                            />
                                            <Typography
                                                component="span"
                                                varient="body2"
                                                color="textPrimary"
                                                className="d-inline-block float-right"
                                                style={{ maxWidth: "70px", wordBreak: "break-all", textAlign: "center" }}
                                            >
                                                {value.uploader.email}
                                            </Typography>
                                        </ListItemAvatar>

                                        <ListItemText
                                            id={value.key}
                                            primary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        color="textPrimary"
                                                        className="d-inline-block float-left"
                                                    >
                                                        <Rating name="read-only" value={value.score} readOnly />
                                                    </Typography>

                                                    <Typography
                                                        component="span"
                                                        color="textPrimary"
                                                        className="d-inline-block float-right"
                                                        style={{ textOverflow: 'ellipsis', overflow: "hidden" }}
                                                    >
                                                        {moment(value.date).format('YYYY-MM-DD HH:mm')}
                                                    </Typography>
                                                    <div className="clearfix"></div>
                                                </>
                                            }
                                            secondary={
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="textPrimary"
                                                    className="mt-2"
                                                >
                                                    {value.comment}
                                                </Typography>
                                            }
                                        />

                                        <ListItemSecondaryAction style={{ right: 0 }}>

                                            <IconButton aria-label="Delete"
                                                onClick={this.handleDeleteComment.bind(this, value.key)}
                                                style={{ display: (this.state.hoveredCommentKey === value.key ? 'inline-block' : 'none') }}>
                                                <DeleteIcon fontSize="default" />
                                            </IconButton>

                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </DialogContent>
                </Dialog>

                {/* Select Instructor Video */}
                <Dialog
                    fullWidth={true}
                    maxWidth="sm"
                    scroll="paper"
                    aria-labelledby="scroll-dialog-title"
                    open={this.state.selectInstructorVideoModalOpenFlag}
                    onClose={this.toggleSelectInstructorVideoModalOpen.bind(this, false)}>

                    <DialogTitle id="scroll-dialog-title">Select A Video ({this.state.instructorVideoList.length})</DialogTitle>

                    <DialogContent dividers={true} className="pl-0 pr-0">
                        {this.state.instructorVideoList.length === 0 &&
                            <Typography
                                component="span"
                                variant="body1"
                                className="d-block pl-4"
                            >There are no uploaded videos yet.</Typography>
                        }

                        {this.state.instructorVideoList.length > 0 &&
                            <List>
                                {this.state.instructorVideoList.map(value => {
                                    return (
                                        <ListItem key={value.key} button
                                            alignItems="flex-start"
                                            style={{ borderLeft: (value.status ? "solid 3px" : 'none') }}
                                            onMouseOver={this.handleInstructorVideoHover.bind(this, value.key)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt={`Video ${value.key}`}
                                                    src={value.thumbnail}
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

                                            <ListItemSecondaryAction style={{ right: "15px", transform: "translateY(-100%)" }}>

                                                <Button color="primary" variant="contained" size="large"
                                                    onClick={this.selectInstructorVideo.bind(this, value.key)}
                                                    className={this.state.hoveredInstructorVideoKey === value.key ? '': 'd-none'}
                                                >
                                                    <CheckIcon className="mr-2" />
                                                    Select
                                                </Button>

                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        }
                    </DialogContent>
                </Dialog>
            </>
        )
    }
}

function mapStateToProps(state) {
    return {
        selectedCourceKey: state.videoUpload.selectedCourceKey,
        videosList: state.videoUpload.currentVideos
    };
}

export default connect(mapStateToProps, null)(Videos);