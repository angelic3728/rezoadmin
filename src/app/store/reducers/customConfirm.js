import {
    ADD_CONFIRM_DIALOG,
    REMOVE_CONFIRM_DIALOG
} from './constants';

const initialData = {
    dialogList: []
};

export default function (state = initialData, action) {
    let newDialogList = [];

    switch (action.type) {
        case ADD_CONFIRM_DIALOG:
            newDialogList = [...state.dialogList]
            newDialogList.push(action.payload);
            return {
                ...state,
                dialogList: newDialogList
            };

        case REMOVE_CONFIRM_DIALOG:
            newDialogList = [...state.dialogList].filter(value => {
                return value.key !== action.payload;
            });
            return {
                ...state,
                dialogList: newDialogList
            }

        default:
            return { ...state };
    }
}