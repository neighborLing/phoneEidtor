import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {getBase64} from '../../utils';
import {message} from "antd";
import {blurBase64} from "../../utils/image";

export interface IImageInfo {
    name: string;
    url: string;
    width: number;
    height: number;
    base64: string;
}

interface Props {
    onChange: (imageInfos: IImageInfo[]) => void;
    multiple?: boolean;
    setLoading?: (loading: boolean) => void;
}

const ImageUploader: React.FC<Props> = ({ onChange, multiple = true, setLoading }) => {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = multiple ? [...files, ...Array.from(selectedFiles)] : [...Array.from(selectedFiles)];
            setFiles(newFiles);
        }
    };

    useEffect(() => {
        handleUpload();
    }, [files]);

    const handleUpload = async () => {
        const imageInfos: IImageInfo[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            try {
                // 上传文件
                setLoading && setLoading(true);
                // const res = await axios.post('http://47.108.29.87:3000/upload', formData);
                setLoading && setLoading(false);
                message.success('上传成功');
                // console.log('res', res);
                // const url = `http://47.108.29.87:3000${res.data}`;
                const url = URL.createObjectURL(file)
                // 获取图片宽高
                const img = new Image();
                img.src = url;
                await new Promise(async (resolve, reject) => {
                    const base64 = await getBase64(file);
                    img.onload = () => {
                        imageInfos.push({
                            name: file.name,
                            url,
                            width: img.width,
                            height: img.height,
                            base64
                        });
                        resolve(null);
                    };
                    img.onerror = (err) => {
                        console.error(err);
                        reject(err);
                    };
                });
            } catch (err) {
                console.error(err);
            }
        }
        onChange(imageInfos);
    };

    return (
        <div style={{ display: 'flex' }}>
            <input type="file" onChange={handleFileChange} multiple={multiple} />
        </div>
    );
};

export default ImageUploader;
