import { createStore } from 'redux';

export interface IPhone {
    name: string,
    width: number,
    height: number,
}

interface IPhonesState {
    phones: IPhone[],
}

const initialPhonesState: IPhonesState = {
    phones: [],
};

function phoneReducer(state: IPhonesState = initialPhonesState, action: any) {
    switch (action.type) {
        case 'update':
            return {
                phones: action.payload,
            }
        default:
            return state;
    }
}

// 创建 store
const store = createStore(phoneReducer);

export default store;
