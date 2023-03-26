import { NodeDragEventParams } from 'antd/lib/tree/Tree'; // 导入 NodeDragEventParams

export type TreeItem = {
    key: string;
    title: string;
    children?: TreeItem[];
};

export type TreeProps = {
    data: TreeItem[];
    onDrop: (info: NodeDragEventParams<TreeItem>) => void;
};