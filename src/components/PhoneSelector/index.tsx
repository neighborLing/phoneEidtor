import React, {useState} from 'react';
import {Select} from 'antd';
import './index.less';
import {useSelector} from 'react-redux';
import Editor from "../Editor";

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
    const [selectedPhone, setSelectedPhone] = useState<PhoneType>(phoneTypes[0] || emptyPhone);
    const [sizeScale, setSizeScale] = useState<number>(75);

    const handlePhoneChange = (value: string) => {
        const phone = phoneTypes.find((p) => p.name === value) || phoneTypes[0] || emptyPhone;
        setSelectedPhone(phone);
    };

    const handleSizeScaleChange = (value: number) => {
        setSizeScale(value);
    };

    const getSelectedPhoneSize = () => {
        const width = selectedPhone.width;
        const height = selectedPhone.height;
        return {width, height};
    };

    return (
        <div className={baseClassName}>
            <Select style={{width: 200}} defaultValue={(phoneTypes[0] || emptyPhone).name} onChange={handlePhoneChange}>
                {phoneTypes.map((phone: PhoneType) => (
                    <Option key={phone.name} value={phone.name}>
                        {phone.name}
                    </Option>
                ))}
            </Select>
            <Select style={{width: 100, marginLeft: 10}} defaultValue={sizeScale} onChange={handleSizeScaleChange}>
                <Option value={50}>50%</Option>
                <Option value={75}>75%</Option>
                <Option value={100}>100%</Option>
                <Option value={125}>125%</Option>
                <Option value={150}>150%</Option>
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
        </div>
    );
};

export default Index;
