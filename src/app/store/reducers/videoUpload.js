import {
    SET_CATEGORY_INFORMATION,
    SET_COURCE_INFORMATION
} from '../../pages/home/videoUpload/constants';

const initialData = {
    selectedCategoryKey: '',
    selectedCourceKey: '',
    currentCources: [],
    currentVideos: []
};

export default function (state = initialData, action) {
    switch (action.type) {
        case SET_CATEGORY_INFORMATION:
            return {
                ...state,
                selectedCategoryKey: action.payload.categoryKey,
                currentCources: action.payload.cources,
                selectedCourceKey: action.payload.cources[0] ? action.payload.cources[0].key : ''
            };

        case SET_COURCE_INFORMATION:
            return {
                ...state,
                selectedCourceKey: action.payload.courceKey,
                currentVideos: action.payload.videos
            }

        default:
            return { ...state };
    }
}