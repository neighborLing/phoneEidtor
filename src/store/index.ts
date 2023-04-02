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

export interface ITreeNode {
    title: string,
    key: string,
    children: ITreeNode[],
    zIndex?: number,
}

export interface ITemplate {
    name: string
    tree: ITreeNode[]
    id: number
}

interface ITree {
    tree: ITreeNode[],
    treeTemplates?: ITemplate[],
}

function addZIndex(treeData: ITreeNode[], parentZIndex: number = 0) {
    let index = 1;
    for (const node of treeData) {
        node.zIndex = index + parentZIndex;
        index++;
        if (node.children && node.children.length > 0) {
            addZIndex(node.children, node.zIndex * 10 + 1);
        }
    }

    return treeData;
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
    tree: addZIndex(window.localStorage.getItem('layoutTree') ? JSON.parse(window.localStorage.getItem('layoutTree') as string) : []),
    treeTemplates: window.localStorage.getItem('layoutTreeTemplates') ? JSON.parse(window.localStorage.getItem('layoutTreeTemplates') as string) : [],
}

function treeReducer(state: ITree = initialTreeState, action: any) {
    switch (action.type) {
        case 'updateLayoutTree':
            const tree = action.payload;
            window.localStorage.setItem('layoutTree', JSON.stringify(tree));

            return {
                ...state,
                tree: addZIndex(action.payload),
            }
        case 'updateLayoutTreeTemplates':
            const treeTemplates = action.payload;
            window.localStorage.setItem('layoutTreeTemplates', JSON.stringify(treeTemplates));
            return {
                ...state,
                treeTemplates: action.payload,
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
        background: '#333333'
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
