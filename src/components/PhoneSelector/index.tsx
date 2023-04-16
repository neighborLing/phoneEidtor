import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import './index.less';
import {useSelector} from 'react-redux';
import Editor from "../Editor";
import store, {ITreeNode} from "../../store/index";
import _ from "lodash";

const {Option} = Select;
const baseClassName = 'phone-selector';

type PhoneType = {
    name: string;
    width: number;
    height: number;
};

const emptyPhone = {
    name: '',
    width: 0,
    height: 0,
}

const Index = () => {
    const { phones: phoneTypes } = useSelector((state: any) => state.phones);
    const { showExportBox } = useSelector((state: any) => state.exportBox);
    const [selectedPhone, setSelectedPhone] = useState<PhoneType>(emptyPhone);
    useEffect(() => {
        setSelectedPhone(emptyPhone);
        console.log('phoneTypes', phoneTypes)
    }, [phoneTypes])

    useEffect(() => {
        store.dispatch({
            type: 'updatePhoneSize',
            payload: {
                width: selectedPhone.width,
                height: selectedPhone.height,
            }
        })
    }, [
        selectedPhone
    ])

    const handleResizeTree = (tree, originSize) => {
        //     获取当前手机宽高
        const { phoneSize } = store.getState().phones;
        const { width, height } = phoneSize;
        const { width: originWidth, height: originHeight } = originSize;
        // 遍历树，按比例调整每个节点的宽高
        const resizeTree = _.cloneDeep(tree);
        const resizeNode = (node: ITreeNode) => {
            if (node.children) {
                node.children.forEach((child: ITreeNode) => {
                    resizeNode(child);
                })
            }
            if (!node.position) return;
            node.position.width = node.position.width * width / originWidth;
            node.position.height = node.position.height * height / originHeight;
            node.position.left = node.position.left * width / originWidth;
            node.position.top = node.position.top * height / originHeight;
        }
        resizeNode(resizeTree);
        return resizeTree;
    }

    const handlePhoneChange = (value: string) => {
        const phone = phoneTypes.find((p) => p.name === value) || phoneTypes[0] || emptyPhone;
        setSelectedPhone(phone);
        const { tree } = store.getState().trees;
        const originSize = window.localStorage.getItem('currentSize');

        store.dispatch({
            type: 'updateLayoutTree',
            payload: {
                tree: handleResizeTree(tree, originSize ? JSON.parse(originSize) : { width: phone.width, height: phone.height }),
            }
        })
    };


    const getSelectedPhoneSize = () => {
        const width = selectedPhone.width;
        const height = selectedPhone.height;
        return {width, height};
    };

    return (
        <div className={baseClassName}>
            <div>
                <Select style={{width: 300}} onChange={handlePhoneChange} value={selectedPhone.name}>
                    {phoneTypes.map((phone: PhoneType) => (
                        <Option key={phone.name} value={phone.name}>
                            {phone.name} | {phone.width}x{phone.height}
                        </Option>
                    ))}
                </Select>
                <div
                    style={{
                        width: getSelectedPhoneSize().width / 3,
                        height: getSelectedPhoneSize().height / 3,
                        backgroundColor: '#ccc',
                        marginTop: 10,
                    }}
                >
                    <Editor />
                </div>
                {
                    showExportBox ? <div style={{
                        width: '10px',
                        height: '10px',
                        // overflow: "hidden"
                    }}>
                        <div
                            style={{
                                width: getSelectedPhoneSize().width,
                                height: getSelectedPhoneSize().height,
                                backgroundColor: '#ccc',
                                marginTop: 10,
                            }}
                        >
                            <Editor forExport={true} />
                        </div>
                    </div> : null
                }
            </div>
        </div>
    );
};

export default Index;
