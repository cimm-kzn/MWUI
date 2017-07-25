import {TRIGGER} from '../constants';

const initState = {
    visible: false,
    id: 0
};

const triggerModal = (state = initState , action) => {
    switch (action.type) {
        case TRIGGER:
            return {visible: action.bool, id: action.id, cml: action.cml};
        default:
            return state
    }
};

export default triggerModal;
