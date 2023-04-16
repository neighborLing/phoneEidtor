import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import './index.less';
import {useSelector} from 'react-redux';
import Editor from "../Editor";
import store from "../../store/index";
import { handleResizeTree } from '../../utils/tree';

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

    const handlePhoneChange = (value: string) => {
        const phone = phoneTypes.find((p) => p.name === value) || phoneTypes[0] || emptyPhone;
        const newSize = {
            width: phone.width,
            height: phone.height,
        }
        setSelectedPhone(phone);
        const { tree } = store.getState().trees;
        // 获取模版的宽高
        const originSize = window.localStorage.getItem('currentSize');
        if (originSize) {
            store.dispatch({
                type: 'updateLayoutTree',
                payload: handleResizeTree(tree, JSON.parse(originSize), newSize)
            })
        };
        window.localStorage.setItem('currentSize', JSON.stringify({
            width: phone.width,
            height: phone.height,
        }))
        store.dispatch({
            type: 'updatePhoneSize',
            payload: newSize
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
                        overflow: "hidden"
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
