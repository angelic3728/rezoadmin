import React, { Component } from 'react';
import { Formik } from "formik";
import PropTypes from 'prop-types';

import {
    Divider,
    Modal,
    Typography,
    Button
} from "@material-ui/core";

import firebase from '../../../services/firebase';
// import * as customSnackbar from '../../../services/customSnackbar';
// import { instance } from '../../../services';

export class SchoolDetail extends Component {

    constructor(props) {
        super(props);

        this.state = {
            teachers: []
        }
    }

    componentDidMount() {
        var school_info = (this.props.modalInitialValues.data !== undefined) ? this.props.modalInitialValues.data[0] : "";
        this.getTeacherName(school_info.teachers);
    }

    getTeacherName(uids) {
        var self = this;
        var schoool_teachers = [];
        uids.map((item, index) => {
            var one_teacher = item;
            firebase.database().ref('users').orderByKey().equalTo(item.uid).on('value', function (snapshot) {
                if (snapshot.numChildren() !== 0) {
                    schoool_teachers.push(snapshot.val()[one_teacher.uid].name)
                }
            })
            if (index === uids.length - 1)
                self.setState({
                    teachers: schoool_teachers
                })
        })

    }

    render() {
        var self = this;
        var school_info = (this.props.modalInitialValues.data !== undefined) ? this.props.modalInitialValues.data[0] : "";
        var styleFloatLeft = { fontSize: "18px", marginBottom: "0px", float: "left" };
        var styleCourse = { fontSize: "15px", marginBottom: "3px" };
        var styleFullWidth = { float: "left", width: "100%", backgroundColor: "#e2e2e1", padding: "8px", borderRadius: "4px", color: "black", marginBottom: "10px", boxShadow: "2px 5px 4px 1px grey" };
        return (
            <Modal
                aria-labelledby="add-modal-title"
                aria-describedby="add-modal-description"
                open={this.props.open}
                onClose={this.props.onClose}>
                <div>
                    <div className="p-4" style={{
                        position: "absolute",
                        width: "70%",
                        backgroundColor: "white",
                        boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                        padding: "",
                        outline: "none",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        height: "85%"
                    }}>
                        <Typography variant="h3" id="modal-title" style={{ marginBottom: "10px" }}>
                            {school_info.name}
                        </Typography>
                        <div className="row" style={{ maxHeight: "85%", overflowY: "scroll" }}>
                            <div className="col-md-6" style={styleFloatLeft}>
                                <Typography variant="h6" style={{ margin: "10px 0px" }}>
                                    <i className="flaticon-paper-plane-1"></i>{" Classes(" + school_info.classes.length + ")"}
                                </Typography>
                                {school_info.classes.map((item, index) => (
                                    <div style={styleFullWidth} className="label-item" key={index}>
                                        <div className="col-md-5" style={{ float: "left", marginTop: "20px" }}>
                                            <p style={{ fontSize: "18px", marginBottom: "0px" }}>
                                                <span style={{ fontWeight: "bold" }}>Name : </span>{item.name}
                                            </p>
                                            <p style={{ fontSize: "18px", marginBottom: "0px", marginTop: "10px" }}>
                                                <span style={{ fontWeight: "bold" }}>Level : </span>{item.level}
                                            </p>
                                        </div>
                                        <div className="col-md-7" style={{ float: "left" }}>
                                            <p style={styleFloatLeft}>
                                                <span style={{ fontWeight: "bold" }}>Courses</span>
                                            </p>
                                            <div style={{ backgroundColor: "white", float: "left", borderRadius: "5px", padding: "8px", width: "100%" }}>
                                                {item.courses !== undefined &&
                                                    item.courses.map((unit, index) => (
                                                        <div key={index}>
                                                            <p style={styleCourse}>
                                                                Coef: {unit.coef}
                                                            </p>
                                                            <p style={styleCourse}>
                                                                Name: {unit.name}
                                                            </p>
                                                            <p style={styleCourse}>
                                                                DayOfWeek: {unit.times[0].dayOfWeek}
                                                            </p>
                                                            <p style={styleCourse}>
                                                                Time: {unit.times[0].start_time} ~ {unit.times[0].end_time}
                                                            </p>
                                                            {(index !== item.courses.length - 1) &&
                                                                <Divider style={{ margin: "10px 0px" }} />
                                                            }
                                                        </div>
                                                    ))
                                                }
                                                {item.courses === undefined &&
                                                    <p>No course</p>
                                                }
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                            <div className="col-md-6" style={styleFloatLeft}>
                                <Typography variant="h6" style={{ margin: "10px 0px" }}>
                                    <i className="flaticon-users-1"></i>{" Teachers(" + school_info.teachers.length + ")"}
                                </Typography>
                                {school_info.teachers.map((item, index) => (
                                    <div style={styleFullWidth} className="label-item" style={{ padding: "15px", marginBottom: "10px", boxShadow: "2px 5px 4px 1px grey" }} key={index}>
                                        <p style={{ marginBottom: "0px" }}>
                                            <b>Name : </b> <span>{self.state.teachers[index]}</span>
                                        </p>
                                        <p style={{ marginBottom: "0px", marginTop: "15px" }}>
                                            <span style={{ fontWeight: "bold" }}>Course : </span>{item.courses}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button onClick={self.props.onClose} style={{
                            float: "right",
                            backgroundColor: "#01ab94",
                            marginTop: "8px",
                            "color":"white"
                        }}>
                            CLOSE
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }
}

SchoolDetail.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    modalInitialValues: PropTypes.object
}

export default SchoolDetail;