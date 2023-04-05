import React, {useRef, useState} from "react";
import {Button,Input,Modal,message,Select} from "antd";
import "./index.less";
import LocalFileUploader from "../LocalFileUploader";
import {useDispatch, useSelector} from 'react-redux';
import { IPhone, ITreeNode, ITemplate } from '../../store';
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
        const selectedTree = treeTemplates.find((treeTemplate: ITemplate) => treeTemplate.name === value);
        if (selectedTree) {
            dispatch({
                type: 'updateLayoutTree',
                payload: _.cloneDeep(selectedTree.tree)
            })
        }
    }

    const onExportImage = () => {
        const editor = document.getElementById('phoneEditor');
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
            }} onChange={selectTree}>
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
