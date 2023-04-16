import {combineReducers, createStore} from 'redux';
import {message} from 'antd';
import {IPosition} from './index.d';
import axios from "axios";
import _ from 'lodash';

export interface IPhone {
    name: string,
    width: number,
    height: number,
}

interface IPhonesState {
    phones: IPhone[],
    phoneSize: {
        width: number,
        height: number
    }
}

export interface ITreeNode {
    title: string,
    key: string,
    children: ITreeNode[],
    zIndex?: number,
    position?: IPosition,
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

export function addZIndex(treeData: ITreeNode[], parentZIndex: number = 0) {
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
    phones: [],
    phoneSize: {
        width: 0,
        height: 0
    }
};

function phoneReducer(state: IPhonesState = initialPhonesState, action: any) {
    switch (action.type) {
        case 'updatePhones':
            axios.post('http://47.108.29.87:3000/files/phones/content', {
                content: JSON.stringify(action.payload)
            }).then(() => {
                message.success('上传成功');
            })
            return {
                phones: action.payload,
            }
        case 'updatePhones2':
            return {
                phones: action.payload,
            }
        case 'updatePhoneSize':
            return {
                ...state,
                phoneSize: action.payload
            }
        default:
            return state;
    }
}

const initialTreeState: ITree = {
    tree: addZIndex(window.localStorage.getItem('layoutTree') ? JSON.parse(window.localStorage.getItem('layoutTree') as string) : []),
    treeTemplates: [],
    // tree: [],
    // treeTemplates: []
}

const removeBase64 = (tree: ITreeNode[]) => {
// 所有节点的position的base64都去掉
    for (const node of tree) {
        if (node.children && node.children.length > 0) {
            removeBase64(node.children);
        }
        if (node.position) {
            delete node.position.base64;
        }
    }

    return tree
}

function treeReducer(state: ITree = initialTreeState, action: any) {
    switch (action.type) {
        case 'updateLayoutTree':
            const tree = action.payload;
            window.localStorage.setItem('layoutTree', JSON.stringify(tree));

            // axios.post('http://47.108.29.87:3000/files/tree/content', {
            //     content: JSON.stringify(tree)
            // });

            // debugger
            return {
                ...state,
                tree: addZIndex(action.payload),
            }
        case 'updateLayoutTree2':
            // debugger
            return {
                ...state,
                tree: addZIndex(action.payload),
            }
        case 'updateLayoutTreeTemplates':
            const treeTemplates = action.payload;
            // window.localStorage.setItem('layoutTreeTemplates', JSON.stringify(treeTemplates));
            axios.post('http://47.108.29.87:3000/files/trees/content', {
                content: JSON.stringify(_.cloneDeep(treeTemplates).map(({
                    name, tree, ...rest
                }) => ({
                    name,
                    tree: removeBase64(tree),
                    ...rest
                })))
            });
            return {
                ...state,
                treeTemplates: action.payload || [],
            }
        case 'updateLayoutTreeTemplates2':
            return {
                ...state,
                treeTemplates: action.payload || [],
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
        background: '#1890ff'
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

const initialExportBoxState = {
    showExportBox: false
}

function showExportBoxReducer(state = initialExportBoxState, action: any) {
    switch (action.type) {
        case 'showExportBox':
            return {
                ...state,
                showExportBox: true
            }
        case 'hideExportBox':
            return {
                ...state,
                showExportBox: false
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    phones: phoneReducer,
    trees: treeReducer,
    contentBox: contentBoxReducer,
    exportBox: showExportBoxReducer
});

// 创建 store
const store = createStore(rootReducer);

export default store;
