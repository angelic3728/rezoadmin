import {
    ADD_CUSTOM_SNACK_BAR,
    REMOVE_CUSTOM_SNACK_BAR
} from './constants';

const initialData = {
    snackBarcontents: []
};

export default function (state = initialData, action) {
    switch (action.type) {
        case ADD_CUSTOM_SNACK_BAR:
            const newSnackBarcontents = [...state.snackBarcontents]
            newSnackBarcontents.push(action.payload);
            return {
                ...state,
                snackBarcontents: newSnackBarcontents
            };

        case REMOVE_CUSTOM_SNACK_BAR:
            const newcontents = [...state.snackBarcontents].filter(value => {
                return value.key !== action.payload;
            });
            return {
                ...state,
                snackBarcontents: newcontents
            }

        default:
            return { ...state };
    }
}