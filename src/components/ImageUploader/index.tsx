import React, { useEffect, useState } from 'react';
import axios from 'axios';

export interface IImageInfo {
    name: string;
    url: string;
    width: number;
    height: number;
}

interface Props {
    onChange: (imageInfos: IImageInfo[]) => void;
    multiple?: boolean;
}

const ImageUploader: React.FC<Props> = ({ onChange, multiple = true }) => {
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
                const res = await axios.post('http://localhost:3000/upload', formData);
                console.log('res', res);
                const url = `http://localhost:3000${res.data}`;
                // 获取图片宽高
                const img = new Image();
                img.src = url;
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        imageInfos.push({
                            name: file.name,
                            url,
                            width: img.width,
                            height: img.height,
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
