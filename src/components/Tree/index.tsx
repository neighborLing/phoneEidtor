import {Tree, Modal, Form, Input, Select, message, Button} from 'antd';
import type {DataNode, TreeProps} from 'antd/es/tree';
import React, {useState, useEffect, ReactElement} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Dropdown, Space} from 'antd';
import store from '../../store';
import _ from 'lodash';
import './index.less';
import {useSelector} from 'react-redux';
import {findParentNode, findCurrentNode} from '../../utils/tree';
import ImageUploader from "../ImageUploader";
import {IImageInfo} from "../ImageUploader";
import {IPosition} from '../../store/index.d';

const cls = 'layout-tree'

const x = 3;
const y = 2;
const z = 1;
const defaultData: DataNode[] = [];
const {Option} = Select

const shapeOptions = [
    { key: 'image', value: '图片' },
    { key: 'rectangle', value: '矩形' },
    { key: 'roundedRectangle', value: '圆角矩形' },
    { key: 'rotundity', value: '圆形' },
    { key: 'lozenge', value: '菱形' },
    { key: 'triangle', value: '三角形' },
    { key: 'heart', value: '心形' },
    { key: 'text', value: '文字' }
];



interface ITreeNode extends DataNode {
    position?: IPosition
    nodeType: string
    children?: ITreeNode[]
}

const LayoutTree: React.FC = () => {
    const {tree} = useSelector((state: any) => state.trees);
    const [gData, setGData] = useState<DataNode[]>(defaultData);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState<{
        title: string
        type: string
    }>({
        title: '',
        type: ''
    });
    const [currentKey, setCurrentKey] = useState('');
    const [imageInfos, setImageInfos] = useState<IImageInfo[]>([]);
    const { contentBoxKey } = useSelector((state: any) => state.contentBox);

    // 获取所有节点的key值
    function getAllkeys(data: DataNode[]) {
        let keys: string[] = [];
        data.forEach(item => {
            keys.push(item.key as string)
            if (item.children) {
                keys = keys.concat(getAllkeys(item.children))
            }
        })
        return keys;
    }

    useEffect(() => {
        setCurrentKey(contentBoxKey)
    }, [contentBoxKey])

    useEffect(() => {
        const gData = formatToTreeNode(_.cloneDeep(tree))
        setGData(gData)
    }, [tree])


    const handleTreeNodeClick = (key: string) => {
        setCurrentKey(key)
        store.dispatch({
            type: 'setContentBoxKey',
            payload: key
        })
    }

    function createNewTree() {
        const now = Date.now()
        const key = `root-${now}`
        const curItem: ITreeNode = {
            title: <div onClick={() => handleTreeNodeClick(key)}>
                图层
                <Dropdown
                    menu={{
                        items
                    }}
                >
                    <Space>
                        <PlusOutlined/>
                    </Space>
                </Dropdown>
            </div>, key, children: []
        }
        const data = [
            curItem
        ]
        setGData(data)
        const treeData = formatToTreeData(_.cloneDeep(data))
        store.dispatch({
            type: 'updateLayoutTree',
            payload: treeData
        })
        // @ts-ignore
        setExpandedKeys(getAllkeys(treeData))
    }

    function initGData() {
        if (gData.length) return;
        if (tree.length) {
            const gData = formatToTreeNode(tree)
            console.log('gData', gData)
            return setGData(gData)
        }
        createNewTree()
    }

    useEffect(() => {
        initGData()
    }, [])

    const items: MenuProps['items'] = [
        {
            key: 'add-sibling',
            label: '新增图层',
            onClick: () => {
                showModal('add');
            },
        },
        {
            key: 'add-node',
            label: '新增子图层',
            onClick: () => {
                showModal('addChild');
            },
        },
        {
            key: 'delete',
            label: '删除',
            onClick: () => {
                showModal('delete');
            },
        }
    ];

    const formatToTreeData = (data: DataNode[]) => {
        return data.map(item => {
            if (item.children) {
                const titleProps = (item.title as ReactElement)?.props || {}
                return {
                    ...item,
                    title: titleProps?.children[0],
                    children: formatToTreeData(item.children)
                }
            }
            return item
        })
    }

    const formatToTreeNode = (data: DataNode[]) => {
        return data.map(item => {
            // @ts-ignore
            const title = <div onClick={() => handleTreeNodeClick(item.key as string)}>
                {item.title}
                <Dropdown
                    menu={{
                        items
                    }}
                >
                    <Space>
                        <PlusOutlined/>
                    </Space>
                </Dropdown>
            </div>
            if (item.children) {
                // @ts-ignore
                return {
                    ...item,
                    title,
                    children: formatToTreeNode(item.children)
                }
            } else {
                return {
                    ...item,
                    title
                }
            }
        })
    }

    const onDragEnter: TreeProps['onDragEnter'] = info => {
        // expandedKeys 需要受控时设置
        // setExpandedKeys(info.expandedKeys)
    };

    const onDrop: TreeProps['onDrop'] = info => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (
            data: DataNode[],
            key: React.Key,
            callback: (node: DataNode, i: number, data: DataNode[]) => void,
        ) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children!, key, callback);
                }
            }
        };
        const data = [...gData];

        // Find dragObject
        let dragObj: DataNode;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else if (
            ((info.node as any).props.children || []).length > 0 && // Has children
            (info.node as any).props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
                // in previous version, we use item.children.push(dragObj) to insert the
                // item to the tail of the children
            });
        } else {
            let ar: DataNode[] = [];
            let i: number;
            loop(data, dropKey, (_item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i!, 0, dragObj!);
            } else {
                ar.splice(i! + 1, 0, dragObj!);
            }
        }
        setGData(_.cloneDeep(data));
    };

    // 新增节点的表单数据
    const [form] = Form.useForm();

    const showModal = (type: 'add' | 'addChild' | 'delete') => {
        form.setFieldsValue({
            nodeType: 'image',
        })
        setModalVisible(true);
        form.resetFields();
        form.setFieldValue('nodeType', 'image')
        setModalInfo({
            ...modalInfo,
            title: type.includes('add') ? (type === 'add' ? '新增同级' : '新增子节点') : '删除节点',
            type
        })
    };

    const handleOk = () => {
        const {type} = modalInfo

        if (type === 'delete') {
            const parentNode = findParentNode(gData, currentKey)
            if (parentNode) {
                parentNode.children = parentNode.children?.filter(item => item.key !== currentKey)

                setGData(_.cloneDeep(gData))
                const treeData = formatToTreeData(_.cloneDeep(gData))
                store.dispatch({
                    type: 'updateLayoutTree',
                    payload: treeData
                })
                // @ts-ignore
                setExpandedKeys(getAllkeys(treeData))
            }
            setModalVisible(false);
        } else {
            form.submit();
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const createNewItem = ({
                               nodeName,
                               key,
                               nodeType,
                               position,
                           }: {
        nodeName: string,
        key: string,
        nodeType: string,
        position: IPosition,
    }) => {
        return {
            title: <div onClick={() => handleTreeNodeClick(key)}>
                {nodeName}
                <Dropdown
                    menu={{
                        items
                    }}
                >
                    <Space>
                        <PlusOutlined/>
                    </Space>
                </Dropdown>
            </div>, key, children: [], nodeType, position
        }
    }

    const handleRectangleType = (values: any) => {
        const {nodeType} = values
        const now = Date.now()
        const key = `${nodeType}-${now}`
        const position = {
            width: 100,
            height: 100,
            left: 0,
            top: 0,
            remote: 0,
            background: '#1890ff',
            fontFamily: 'ChannelSlanted2',
            fontSize: 14,
            color: '#fff',
            content: ''
        }
        const nodeName = shapeOptions.find(i => i.key === nodeType)?.value || '未知'
        const newItem = createNewItem({nodeName, key, nodeType, position})

        return [newItem]
    }

    const handleImageType = (values: any) => {
        const newItems = imageInfos.map((item, index) => {
            const {nodeType} = values
            const now = Date.now()
            const key = `${nodeType}-${now}-${index}`
            const position = {
                width: 100,
                height: Math.floor(item.height / item.width * 100),
                // 原有图片的宽高比
                ratio: item.height / item.width,
                left: 0,
                top: 0,
                remote: 0,
                background: `url("${item.url}") 0% 0% / 100% 100%`,
                url: item.url,
                base64: item.base64,
            }
            return createNewItem({nodeName: `${item.name}-${index}`, key, nodeType, position})
        })

        return newItems
    }


    const onFinish = (values: any) => {
        const {nodeType} = values
        const {type} = modalInfo
        const newItems = []

        switch (nodeType) {
            case 'image':
                newItems.push(...handleImageType(values))
                break
            default:
                newItems.push(...handleRectangleType(values))
                break
        }

        if (type === 'add') {
            //     根据id获取其父节点
            const parentNode = findParentNode(gData, currentKey)
            if (parentNode) {
                parentNode?.children?.push(...newItems)
            }
        } else {
            const curItem = findCurrentNode(gData, currentKey)
            if (!curItem) {
                return message.info('没找到')
            }
            curItem.children = curItem.children || []
            curItem.children = [...newItems, ...curItem.children]
        }

        setGData(_.cloneDeep(gData))
        const treeData = formatToTreeData(_.cloneDeep(gData))
        store.dispatch({
            type: 'updateLayoutTree',
            payload: treeData
        })
        // @ts-ignore
        setExpandedKeys(getAllkeys(treeData))

        // 处理新增节点的逻辑
        setModalVisible(false);
    };

    const generateData = (_level: number, _preKey?: React.Key, _tns?: DataNode[]) => {
        const preKey = _preKey || '0';
        const tns = _tns || defaultData;

        const children = [];
        for (let i = 0; i < x; i++) {
            const key = `${preKey}-${i}`;
            tns.push({
                title: <div onClick={() => handleTreeNodeClick(key)}>
                    {key}
                    <Dropdown
                        menu={{
                            items
                        }}
                    >
                        <Space>
                            <PlusOutlined/>
                        </Space>
                    </Dropdown>
                </div>, key
            });
            if (i < y) {
                children.push(key);
            }
        }
        if (_level < 0) {
            return tns;
        }
        const level = _level - 1;
        children.forEach((key, index) => {
            tns[index].children = [];
            return generateData(level, key, tns[index].children);
        });
    };
    // generateData(z);

    const handleImageUpload = (imageInfos: IImageInfo[]) => {
        setImageInfos(imageInfos)
    }

    const resetTree = () => {
        const cm = confirm('确认需要重置吗？')
        if (!cm) return
        createNewTree()
    }

    return (
        <div className={cls}>
            {/*draggable*/}
            <Button type="primary" onClick={resetTree} style={{
                marginBottom: '10px'
            }}>重置</Button>
            <Tree
                className="draggable-tree"
                defaultExpandAll={true}
                expandedKeys={expandedKeys}
                blockNode
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                treeData={gData}
                selectedKeys={[currentKey]}
            />
            <Modal title={modalInfo.title} open={modalVisible} onOk={handleOk} onCancel={handleCancel}>
                {
                    modalInfo.type !== 'delete' ? <Form form={form} onFinish={onFinish}>
                        <Form.Item name="nodeType" label="类型" rules={[{required: true, message: '请选择类型'}]}>
                            <Select placeholder="请选择节点类型">
                                {
                                    shapeOptions.map(shape => <Option value={shape.key} key={shape.key}>{shape.value}</Option>)
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item noStyle
                                   shouldUpdate={(prevValues, curValues) => prevValues.nodeType !== curValues.nodeType}>
                            {({getFieldValue}) => getFieldValue('nodeType') === 'image' ?
                                <Form.Item name="image" label="图片" rules={[{required: true, message: '请上传图片'}]}>
                                    <ImageUploader onChange={handleImageUpload}/>
                                </Form.Item> : null}
                        </Form.Item>
                    </Form> : <span>确认删除？</span>
                }
            </Modal>
        </div>
    );
};

export default LayoutTree;