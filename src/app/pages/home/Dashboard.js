import React, { Component } from 'react';
import firebase from '../../services/firebase';
// import instance from '../../services/instance';
// import { useSelector } from "react-redux";
import Chart from './Chart';
import {
  Portlet,
  PortletBody,
  PortletHeader,
  // PortletHeaderToolbar
} from "../../partials/content/Portlet";

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      all_school_cnt: 0,
      all_tweet_cnt: 0,
      all_library_cnt: 0,
      all_teacher_cnt: 0,
      all_finance_amount: 0,
      all_student_cnt: 0,
      all_class_cnt: 0,
      all_exam_cnt: 0

    };
  }

  componentWillMount() {
    let self = this;
    firebase.database().ref('schools').on('value', function (snapshot) {
      if (snapshot.numChildren() !== 0) {
        self.setState({
          all_school_cnt: snapshot.numChildren()
        })

        snapshot.forEach(function (childSnapshot) {
          self.setState({
            all_class_cnt: self.state.all_class_cnt + childSnapshot.val().classes.length
          })
          firebase.database().ref('absences').orderByChild('school_id').equalTo(childSnapshot.key).on('value', function (snapshot1) {
            console.log(snapshot1.val().school_id);
          });
        })

      }
    });

    firebase.database().ref('tweets').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        self.setState({
          all_tweet_cnt: snapshot.numChildren()
        })
      }
    });

    firebase.database().ref('transactions').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        snapshot.forEach(function (item) {
          self.setState({
            all_finance_amount: Number(self.state.all_finance_amount) + Number(item.val().amount)
          })
        });
      }
    });

    firebase.database().ref('library').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        self.setState({
          all_library_cnt: snapshot.numChildren()
        })
      }
    });

    firebase.database().ref('users').orderByChild('type').equalTo('STUDENT').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        self.setState({
          all_student_cnt: snapshot.numChildren()
        })
      }
    });

    firebase.database().ref('exams').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        self.setState({
          all_exam_cnt: snapshot.numChildren()
        })
      }
    });

    firebase.database().ref('users').orderByChild('type').equalTo('TEACHER').on('value', function (snapshot) {
      if (snapshot.numChildren !== 0) {
        self.setState({
          all_teacher_cnt: snapshot.numChildren()
        })
      }
    });

  }


  render() {
    return (
      <div className="row">
        <div className="col-xl-12">
          <Portlet fluidHeight={false} style={{ background: '#FFF' }}>
            <PortletHeader
              icon={<i className='flaticon-information'></i>}
              title=" All Info"
            />
            <PortletBody>
              <div className="kt-widget12">
                <div className="kt-widget12__content">
                  <div className="kt-widget12__item">
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Schools</span>
                      <span className="kt-widget12__value">{this.state.all_school_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All RS Tweets</span>
                      <span className="kt-widget12__value">{this.state.all_tweet_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Libraries</span>
                      <span className="kt-widget12__value">{this.state.all_library_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Finances</span>
                      <span className="kt-widget12__value">{this.state.all_finance_amount} XOF</span>
                    </div>
                  </div>
                  <div className="kt-widget12__item">
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Teachers</span>
                      <span className="kt-widget12__value">{this.state.all_teacher_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Students</span>
                      <span className="kt-widget12__value">{this.state.all_student_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Classes</span>
                      <span className="kt-widget12__value">{this.state.all_class_cnt}</span>
                    </div>
                    <div className="kt-widget12__info">
                      <span className="kt-widget12__desc">All Exams</span>
                      <span className="kt-widget12__value">{this.state.all_exam_cnt}</span>
                    </div>
                  </div>
                </div>
              </div>

            </PortletBody>
          </Portlet>
          <div className="kt-portlet kt-portlet--height">
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <i className="flaticon2-calendar"></i>
                <h3 className="kt-portlet__head-title">Absences</h3>
              </div>
            </div>
            <div className="kt-portlet__body pr-3 pl-3">
              <Chart bar_Color="#F64E60"/>
            </div>
          </div>
          <div className="kt-portlet kt-portlet--height">
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
              <i className="flaticon2-line-chart"></i>
                <h3 className="kt-portlet__head-title">Finances</h3>
              </div>
            </div>
            <div className="kt-portlet__body pr-3 pl-3">
              <Chart bar_Color="#3699FF"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
