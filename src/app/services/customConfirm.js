import store from '../store/store';
import {
    ADD_CONFIRM_DIALOG,
    REMOVE_CONFIRM_DIALOG
} from '../store/reducers/constants';

// shows a custom confirm dialog
// @params  : params
// params : String (title) or 
//    : Object {
//        autoClose : autoClose flag when confirm dialogKey
//        width : dialog width (sm, md, lg, xl)
//        title : dialog title
//        content : dialog content
//        cancelLabel : dialog cancel Label
//        okLabel : dialog ok Label
//    }
// callback : callback function when confirm done, with dialogKey parameter
const customConfirm = (params, callback) => {
    if (typeof(params) === 'string') {
        params = {
            title: params
        };
    }

    const dialogKey = new Date().getTime() + '_' + Math.random().toString().split('.').pop();
    const autoClose = params.autoClose === false ? false : true;
    store.dispatch({
        type: ADD_CONFIRM_DIALOG,
        payload: {
            key: dialogKey,
            width: params.width || '',
            title: params.title || '',
            content: params.content || '',
            cancelLabel: params.cancelLabel || 'Cancel',
            okLabel: params.okLabel || 'OK',
            autoClose,
            callback
        }
    })
};

const customConfirmClose = (dialogKey) => {
    store.dispatch({
        type: REMOVE_CONFIRM_DIALOG,
        payload: dialogKey
    });
}

export { customConfirmClose };
export default customConfirm;