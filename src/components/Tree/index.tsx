import {Tree, Modal, Form, Input, Select, message, Button} from 'antd';
import type {DataNode, TreeProps} from 'antd/es/tree';
import React, {useState, useEffect, ReactElement} from 'react';
import {PlusOutlined, DeleteOutlined, LockOutlined, UnlockOutlined} from '@ant-design/icons';
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
const defaultData: DataNode[] = [];
const {Option} = Select

const shapeOptions = [
    {key: 'image', value: '图片'},
    {key: 'rectangle', value: '矩形'},
    {key: 'roundedRectangle', value: '圆角矩形'},
    {key: 'rotundity', value: '圆形'},
    {key: 'lozenge', value: '菱形'},
    {key: 'triangle', value: '三角形'},
    {key: 'heart', value: '心形'},
    {key: 'text', value: '文字'}
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
    const {contentBoxKey} = useSelector((state: any) => state.contentBox);

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

    function handleTreeChange(gData: DataNode[]) {
        setGData(gData)
        // @ts-ignore
        setExpandedKeys(getAllkeys(tree))
    }

    useEffect(() => {
        setCurrentKey(contentBoxKey)
    }, [contentBoxKey])

    useEffect(() => {
        console.log('tree chagne')
        const gData = formatToTreeNode(_.cloneDeep(tree))
        handleTreeChange(gData)
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
        // @ts-ignore
        const curItem: ITreeNode = {
            title: '图层', key, children: []
        }
        const treeData = [
            curItem
        ]
        store.dispatch({
            type: 'updateLayoutTree',
            payload: treeData
        })
        const {phoneSize} = store.getState().phones
        window.localStorage.setItem('currentSize', JSON.stringify(phoneSize))
    }

    useEffect(() => {
        if (!tree.length) {
            createNewTree()
        }
    }, [])

    const _items = [
        {
            key: 'add-node',
            label: '新增子图层',
            onClick: () => {
                showModal('addChild');
            },
        },
    ]

    const items: MenuProps['items'] = [
        {
            key: 'add-sibling',
            label: '新增图层',
            onClick: () => {
                showModal('add');
            },
        },
        ..._items,
        {
            key: 'delete',
            label: '删除',
            onClick: () => {
                showModal('delete');
            },
        }
    ];

    // 转为数据节点
    // @ts-ignore
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

    const handleLockLayout = (key: string) => {
        const curItem = findCurrentNode(tree, key)
        if (curItem && curItem.position) {
            // @ts-ignore
            curItem.position.isLock = !curItem.position?.isLock
            const treeData = _.cloneDeep(tree)
            store.dispatch({
                type: 'updateLayoutTree',
                payload: treeData
            })
        }
    }

// 转为树节点
// @ts-ignore
const formatToTreeNode = (data: DataNode[]) => {
    return data.map(item => {
        // @ts-ignore
        const title = <div onClick={() => handleTreeNodeClick(item.key as string)}>
            {item.title}
            <Dropdown
                menu={{
                    // @ts-ignore
                    items: item.key.includes('root') ? _items : items
                }}
            >
                <Space>
                    <PlusOutlined/>
                </Space>
            </Dropdown>
            <span onClick={() => handleLockLayout(item.key as string)} style={{
                marginLeft: '10px',
                cursor: 'pointer'
            }}>
                    {
                        // @ts-ignore
                        item?.position?.isLock ? <LockOutlined/> : <UnlockOutlined/>
                    }
                </span>
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


// 新增节点的表单数据
const [form] = Form.useForm();

const showModal = (type: 'add' | 'addChild' | 'delete') => {
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
        const parentNode = findParentNode(tree, currentKey)
        if (parentNode) {
            parentNode.children = parentNode.children?.filter(item => item.key !== currentKey)
            const treeData = _.cloneDeep(gData)
            store.dispatch({
                type: 'updateLayoutTree',
                payload: treeData
            })
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
        title: nodeName, key, children: [], nodeType, position
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

const handleTextType = (values: any) => {
    const {nodeType} = values
    const now = Date.now()
    const key = `${nodeType}-${now}`
    const position = {
        width: 150,
        height: 100,
        left: 0,
        top: 0,
        remote: 0,
        fontFamily: 'ChannelSlanted2',
        fontSize: 14,
        color: '#000000',
        content: 'placeholder'
    }
    const nodeName = shapeOptions.find(i => i.key === nodeType)?.value || '未知'
    const newItem = createNewItem({nodeName, key, nodeType, position})

    return [newItem]
}

const onFinish = (values: any) => {
    const {nodeType} = values
    const {type} = modalInfo
    const newItems = []

    switch (nodeType) {
        case 'image':
            newItems.push(...handleImageType(values))
            break
        case 'text':
            newItems.push(...handleTextType(values))
            break
        default:
            newItems.push(...handleRectangleType(values))
            break
    }

    if (type === 'add') {
        //     根据id获取其父节点
        const parentNode = findParentNode(tree, currentKey)
        if (parentNode) {
            parentNode?.children?.push(...newItems)
        }
    } else {
        const curItem = findCurrentNode(tree, currentKey)
        if (!curItem) {
            return message.info('没找到')
        }
        curItem.children = curItem.children || []
        curItem.children = [...newItems, ...curItem.children]
    }

    const treeData = _.cloneDeep(tree)
    store.dispatch({
        type: 'updateLayoutTree',
        payload: treeData
    })
    // 处理新增节点的逻辑
    setModalVisible(false);
};

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
        <Button type="primary" onClick={resetTree} style={{
            marginBottom: '10px'
        }}>重置</Button>
        <Tree
            className="draggable-tree"
            defaultExpandAll={true}
            expandedKeys={expandedKeys}
            blockNode
            treeData={gData}
            selectedKeys={[currentKey]}
        />
        <Modal title={modalInfo.title} open={modalVisible} onOk={handleOk} onCancel={handleCancel}>
            {
                modalInfo.type !== 'delete' ? <Form form={form} onFinish={onFinish}>
                    <Form.Item name="nodeType" label="类型" rules={[{required: true, message: '请选择类型'}]}>
                        <Select placeholder="请选择节点类型">
                            {
                                shapeOptions.map(shape => <Option value={shape.key}
                                                                  key={shape.key}>{shape.value}</Option>)
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
}
;

export default LayoutTree;