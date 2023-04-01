// 递归获取当前节点的父节点
import {DataNode} from "antd/es/tree";
import React from "react";

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