// 递归获取当前节点的父节点
import {DataNode} from "antd/es/tree";
import React from "react";
import _ from "lodash";
import store, {ITreeNode} from "../store/index";

export const findParentNode = (data: DataNode[], key: React.Key) => {
    let result: DataNode | undefined
    data.forEach((item) => {
        if (item.children) {
            item.children.forEach((child) => {
                if (child.key === key) {
                    result = item
                } else {
                    if (!item.children) return
                    result = findParentNode(item.children, key)
                }
            })
        }
    })
    return result
}

// 递归寻找当前节点
export const findCurrentNode = (data: DataNode[], key: React.Key) => {
    let result: DataNode | undefined
    data.some((item) => {
        if (item.key === key) {
            result = item
            return true
        } else if (item.children) {
            result = findCurrentNode(item.children, key)
            return !!result
        }
    })
    return result
}


export const handleResizeTree = (tree, originSize, newSize) => {
    //     获取当前手机宽高
    const { width: originWidth, height: originHeight } = originSize;
    const { width: newWidth, height: newHeight } = newSize;
    // 遍历树，按比例调整每个节点的宽高
    const resizeTree = _.cloneDeep(tree);
    store.dispatch({
        type: 'setContentBoxKey',
        payload: ''
    })
    // debugger
    const resizeNode = (node: ITreeNode) => {
        if (node.children) {
            node.children.forEach((child: ITreeNode) => {
                resizeNode(child);
            })
        }
        if (!node.position) return;
        // debugger
        node.position.width = node.position.width * newWidth / originWidth;
        node.position.height = node.position.height * newHeight / originHeight;
        node.position.left = node.position.left * newWidth / originWidth;
        node.position.top = node.position.top * newHeight / originHeight;
    }
    // debugger
    resizeNode(resizeTree[0]);
    return resizeTree;
}