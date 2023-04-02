import React, {useEffect, useState} from 'react';
import { Button } from "antd";

export interface IImageInfo {
    name: string;
    url: string;
    width: number;
    height: number;
}

interface Props {
    onChange: (imageInfos: IImageInfo[]) => void;
}

const ImageUploader: React.FC<Props> = ({ onChange }) => {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = [...files, ...Array.from(selectedFiles)];
            setFiles(newFiles);
        }
    };

    useEffect(() => {
        handleUpload();
    }, [files])

    const handleUpload = () => {
        const reader = new FileReader();
        const imageInfos: IImageInfo[] = [];
        const readFile = (index: number) => {
            if (index >= files.length) {
                onChange(imageInfos)
                return;
            }
            const file = files[index];
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    // 获取图片的宽高
                    const img = new Image();
                    img.src = result;
                    img.onload = () => {
                        imageInfos.push({
                            name: file.name,
                            url: result,
                            width: img.width,
                            height: img.height
                        });
                    }

                }
                readFile(index + 1);
            };
        };
        readFile(0);
    };

    return (
        <div style={{
            display: 'flex',
        }}>
            <input type="file" onChange={handleFileChange} multiple />
            {/*<Button onClick={handleUpload}>上传</Button>*/}
        </div>
    );
};

export default ImageUploader;