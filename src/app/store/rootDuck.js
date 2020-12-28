import { all } from "redux-saga/effects";
import { combineReducers } from "redux";
import { firebaseReducer } from "react-redux-firebase";
import videoUploadReducer from "./reducers/videoUpload";
import customSnackBarReducer from './reducers/customSnackBar';
import customConfirmReducer from './reducers/customConfirm';

import * as auth from "./ducks/auth.duck";
import { metronic } from "../../_metronic";

export const rootReducer = combineReducers({
  auth: auth.reducer,
  i18n: metronic.i18n.reducer,
  builder: metronic.builder.reducer,

  firebaseReducer,

  customSnackBar: customSnackBarReducer,
  customConfirm: customConfirmReducer,

  videoUpload: videoUploadReducer
});

export function* rootSaga() {
  yield all([auth.saga()]);
}
