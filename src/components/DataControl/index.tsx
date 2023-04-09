import React, {useRef, useState} from "react";
import {Button,Input,Modal,message,Select} from "antd";
import "./index.less";
import LocalFileUploader from "../LocalFileUploader";
import {useDispatch, useSelector} from 'react-redux';
import store, { IPhone, ITreeNode, ITemplate } from '../../store';
import _ from 'lodash';
import { toPng } from 'html-to-image';
const { Option } = Select;
const baseClassName = 'data-control';


interface Props {
    onImportTemplate: () => void;
}

const MyComponent: React.FC<Props> = ({
                                          onImportTemplate,
                                      }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const { tree, treeTemplates } = useSelector((state: any) => state.trees);
    const inputRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const dispatch = useDispatch();
    const phonesTextHandler = (text: string) => {
        const phones = text.split('\n');

        return phones.reduce((acc: IPhone[], phone: string) => {
            const [name, width, height] = phone.split(' ');

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
        if (!templateName) message.warning('请输入模板名称');
        if (inputRef.current) {
            treeTemplates.push({
                name: templateName,
                id: Date.now(),
                tree,
            })
            dispatch({
              type: 'updateLayoutTreeTemplates',
                payload: _.cloneDeep(treeTemplates)
            })
        }

        setModalVisible(false);
    }

    const selectTree = (value: string) => {
        const cm = confirm('确定要覆盖当前布局吗？');
        if (!cm) {
            return setSelectedTemplate('');
        }
        const selectedTree = treeTemplates.find((treeTemplate: ITemplate) => treeTemplate.name === value);
        if (selectedTree) {
            dispatch({
                type: 'updateLayoutTree',
                payload: _.cloneDeep(selectedTree.tree)
            })
            setTimeout(() => {
            //     页面刷新
                window.location.reload();
            }, 50)
        }
    }

    const onExportImage = () => {
        store.dispatch({
            type: 'setContentBoxKey',
            payload: ''
        })
        const editor = document.getElementById('phoneEditor')!;
        // 把所有链接都换成base64
        const imgs = editor.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            const src = img.getAttribute('src');
            if (src && src.startsWith('http')) {
                img.setAttribute('src', 'https://img.alicdn.com/tfs/TB1yQJ2QpXXXXX5XpXXXXXXXXXX-200-200.png');
            }

            const image = new Image();
            image.src = src;
            image.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, image.width, image.height);
                const dataURL = canvas.toDataURL('image/png');
                img.setAttribute('src', dataURL);
            }
        }
        if (!editor) return;
        toPng(editor).then(function (dataUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'my-image.png');
            downloadLink.setAttribute('href', dataUrl);
            downloadLink.click();
        })
    }

    return (
        <div className={baseClassName}>
            <LocalFileUploader label='上传手机类型' afterUpload={(text) => {
                message.success('上传成功')
                dispatch({
                    type: 'updatePhones',
                    payload: phonesTextHandler(text),
                })
            }
            }/>
            {/*<div className={`${baseClassName}-button`}><Button onClick={onImportTemplate}>导入模板</Button></div>*/}
            <div className={`${baseClassName}-button`}><Button onClick={() => setModalVisible(true)}>保存模板</Button></div>
            <Select style={{
                width: '200px',
                marginLeft: '10px',
            }} onChange={selectTree} value={selectedTemplate}>
                {treeTemplates.map((treeTemplate: ITemplate) => (
                    <Option key={treeTemplate.name} treeTemplate={treeTemplate.name}>
                        {treeTemplate.name}
                    </Option>
                ))}
            </Select>
            <div className={`${baseClassName}-button`}><Button onClick={onExportImage}>导出图片</Button></div>
            <Modal
                title="保存模板"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => onSaveTemplate()}
            >
                {/* Add the Input component */}
                <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="请输入模板名称"
                    ref={inputRef} // Assign the ref to the Input component
                />
            </Modal>
        </div>
    );
};

export default MyComponent;
