import {combineReducers, createStore} from 'redux';

import {IPosition} from './index.d';

export interface IPhone {
    name: string,
    width: number,
    height: number,
}

interface IPhonesState {
    phones: IPhone[],
}

interface ITreeNode {
    title: string,
    key: string,
    children: ITree[],
}


interface ITree {
    tree: ITreeNode[],
}

const initialPhonesState: IPhonesState = {
    phones: [{
        name: 'iPhone XR',
        width: 828,
        height: 1729,
    }],
};

function phoneReducer(state: IPhonesState = initialPhonesState, action: any) {
    switch (action.type) {
        case 'updatePhones':
            return {
                phones: action.payload,
            }
        default:
            return state;
    }
}

const initialTreeState: ITree = {
    tree: window.localStorage.getItem('layoutTree') ? JSON.parse(window.localStorage.getItem('layoutTree') as string) : [],
}

function treeReducer(state: ITree = initialTreeState, action: any) {
    switch (action.type) {
        case 'updateLayoutTree':
            const tree = action.payload;
            console.log('tree -udpate')
            window.localStorage.setItem('layoutTree', JSON.stringify(tree));
            return {
                tree: action.payload,
            }
        default:
            return state
    }
}



interface IContentBoxState {
    contentBoxKey: string
    position: IPosition
}

const initialPositionState: IContentBoxState = {
    contentBoxKey: '',
    position: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        remote: 0,
        background: ''
    }
}

function contentBoxReducer(state: IContentBoxState = initialPositionState, action: any) {
    switch (action.type) {
        case 'setContentBoxKey':
            return {
                ...state,
                contentBoxKey: action.payload,
            }
        case 'setPosition':
            return {
                ...state,
                position: {
                    ...action.payload
                },
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    phones: phoneReducer,
    trees: treeReducer,
    contentBox: contentBoxReducer,
});

// 创建 store
const store = createStore(rootReducer);

export default store;
