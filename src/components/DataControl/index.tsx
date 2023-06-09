import React, {useRef, useState} from "react";
import {Button,Input,Modal,message,Select,Spin} from "antd";
import "./index.less";
import LocalFileUploader from "../LocalFileUploader";
import {useDispatch, useSelector} from 'react-redux';
import store, { IPhone, ITemplate } from '../../store';
import _ from 'lodash';
import { toPng } from 'html-to-image';
import { handleResizeTree } from '../../utils/tree';
const { Option } = Select;
const baseClassName = 'data-control';
interface Props {}
const MyComponent: React.FC<Props> = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const { treeTemplates } = useSelector((state: any) => state.trees);
    const inputRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const phonesTextHandler = (text: string) => {
        const phones = text.split('\n');

        return phones.reduce((acc: IPhone[], phone: string) => {
            const [name, width, height] = phone.split(' ');
            if (!name || !width || !height) return acc;
            acc.push({
                name,
                width: +width,
                height: +height,
            })

            return acc;
        }, [])
    }
    const onSaveTemplate = () => {
        const tree = store.getState().trees.tree;
        const newTree = JSON.parse(JSON.stringify(tree).replace(/blob:http:\/\/localhost:5173\/[a-z0-9-]+/g, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICRAEAOw=='));
        if (!templateName) message.warning('请输入模板名称');
        if (inputRef.current) {
            const { phoneSize } = store.getState().phones;
            treeTemplates.push({
                name: templateName,
                id: Date.now(),
                tree: newTree,
                width: phoneSize && phoneSize?.width || 0,
                height: phoneSize && phoneSize?.height || 0,
            })
            dispatch({
              type: 'updateLayoutTreeTemplates',
                payload: {
                    treeTemplates: _.cloneDeep(treeTemplates),
                    save: true
                }
            })
        }

        setModalVisible(false);
    }

    const selectTree = (value: string) => {
        const tree = store.getState().trees.tree;
        const { phoneSize = {} } = store.getState().phones;
        if (!phoneSize.width) {
            return message.warning('请先选择手机尺寸')
        }
        if (tree[0].children.length) {
            const cm = confirm('确定要覆盖当前布局吗？');
            if (!cm) {
                return setSelectedTemplate('');
            }
        }
        const selectedTree = treeTemplates.find((treeTemplate: ITemplate) => treeTemplate.name === value);
        if (selectedTree) {
            // window.localStorage.setItem('currentSize', JSON.stringify({
            //     width: selectedTree.width,
            //     height: selectedTree.height,
            // }))

            const resizeTree = handleResizeTree(selectedTree.tree, {
                width: selectedTree.width,
                height: selectedTree.height,
            }, {
                width: phoneSize.width,
                height: phoneSize.height,
            })
            // TODO 获取所有，进行转换
            dispatch({
                type: 'updateLayoutTree',
                // TODO 替换当前树对于的尺寸
                payload: _.cloneDeep(resizeTree)
            })
        }
    }

    const onExportImage = async () => {

        await new Promise((resolve) => {
            store.dispatch({
                type: 'showExportBox'
            })
            setTimeout(resolve, 200)
        })
        store.dispatch({
            type: 'setContentBoxKey',
            payload: ''
        })
        const editor = document.getElementById('phoneEditor')!;
        if (!editor) return;
        setLoading(true);
        toPng(editor).then(function (dataUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'my-image.png');
            downloadLink.setAttribute('href', dataUrl);
            downloadLink.click();
            store.dispatch({
                type: 'hideExportBox'
            })
            setLoading(false);
        })
    }

    const handleDelTemplate = (e, temp) => {
        e.stopPropagation()
        const cm = confirm('确定要删除该模板吗？');
        if (!cm) return;
        const treeTemplates = store.getState().trees.treeTemplates;
        const newTreeTemplates = treeTemplates.filter((treeTemplate: ITemplate) => treeTemplate.id !== temp.id);

        dispatch({
            type: 'updateLayoutTreeTemplates',
            payload: {
                treeTemplates: newTreeTemplates,
                save: true
            }
        })
    }

    return (
        <div className={baseClassName}>
            <LocalFileUploader label='上传手机类型' afterUpload={(text) => {
                message.success('上传成功')
                dispatch({
                    type: 'updatePhones',
                    payload: {
                        phones: phonesTextHandler(text),
                        save: true
                    },
                })
            }
            }/>
            <div className={`${baseClassName}-button`}><Button onClick={() => setModalVisible(true)}>保存模板</Button></div>
            <Select style={{
                width: '200px',
                marginLeft: '10px',
            }} onChange={selectTree} value={selectedTemplate}>
                {treeTemplates.map((treeTemplate: ITemplate) => (
                    <Option key={treeTemplate.name} treeTemplate={treeTemplate.name}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                            <span>{treeTemplate.name}</span>
                            <span style={{
                                color: 'red',
                                cursor: 'pointer',
                            }} onClick={(e) => handleDelTemplate(e, treeTemplate)}>
                                ✖
                            </span>
                        </div>
                    </Option>
                ))}
            </Select>
            <Spin spinning={loading} >
                <div className={`${baseClassName}-button`}><Button onClick={onExportImage}>导出图片</Button></div>
            </Spin>
            <Modal
                title="保存模板"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => onSaveTemplate()}
            >
                <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="请输入模板名称"
                    ref={inputRef}
                />
            </Modal>
        </div>
    );
};

export default MyComponent;
