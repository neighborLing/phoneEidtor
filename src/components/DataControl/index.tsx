import React from "react";
import {Button} from "antd";
import "./index.less";
import LocalFileUploader from "../LocalFileUploader";
import {useDispatch, useSelector} from 'react-redux';
import { IPhone } from '../../store';
const baseClassName = 'data-control';


interface Props {
    onImportTemplate: () => void;
    onExportTemplate: () => void;
    onExportImage: () => void;
}

const MyComponent: React.FC<Props> = ({
                                          onImportTemplate,
                                          onExportTemplate,
                                          onExportImage,
                                      }) => {
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
    return (
        <div className={baseClassName}>
            <LocalFileUploader label='上传手机类型' afterUpload={(text) => dispatch({
                type: 'updatePhones',
                payload: phonesTextHandler(text),
                })
            }/>
            <div className={`${baseClassName}-button`}><Button onClick={onImportTemplate}>导入模板</Button></div>
            <div className={`${baseClassName}-button`}><Button onClick={onExportTemplate}>导出模板</Button></div>
            <div className={`${baseClassName}-button`}><Button onClick={onExportImage}>导出图片</Button></div>
        </div>
    );
};

export default MyComponent;
