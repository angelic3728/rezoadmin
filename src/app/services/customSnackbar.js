import store from '../store/store';
import {
    ADD_CUSTOM_SNACK_BAR
} from '../store/reducers/constants';

const addSnackbar = (params) => {
    store.dispatch({
        type: ADD_CUSTOM_SNACK_BAR,
        payload: {
            key: new Date().getTime() + '_' + Math.random().toString().split('.').pop(),
            message: params.message || "",
            variant: params.variant || 'success',
            anchorOrigin: params.anchorOrigin || {
                vertical: "top",
                horizontal: "right"
            },
            autoHideDuration: params.autoHideDuration || 5000
        }
    })
};

const success = (params) => {
    if (typeof(params) === "string") {
        params = { message: params };
    }

    addSnackbar({
        ...params,
        variant: "success"
    });
}

const warning = (params) => {
    if (typeof(params) === "string") {
        params = { message: params };
    }
    
    addSnackbar({
        ...params,
        variant: "warning"
    });
}

const error = (params) => {
    if (typeof(params) === "string") {
        params = { message: params };
    }
    
    addSnackbar({
        ...params,
        variant: "error"
    });
}

const info = (params) => {
    if (typeof(params) === "string") {
        params = { message: params };
    }
    
    addSnackbar({
        ...params,
        variant: "info"
    });
}

export { addSnackbar as default, success, warning, error, info };