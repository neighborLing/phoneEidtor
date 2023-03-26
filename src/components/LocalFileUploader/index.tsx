import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface IProps {
    afterUpload: (text: string) => void;
    label: string;
}

const FileUpload: React.FC<IProps> = (props: IProps) => {
  const { afterUpload, label = 'Click to Upload' } = props
  const handleUpload = (file: File) => {

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      afterUpload(reader.result as string)
    };
  };

  return (
    <>
      <Upload
        showUploadList={false}
        beforeUpload={(file) => {
          handleUpload(file);
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>{label}</Button>
      </Upload>
    </>
  );
};

export default FileUpload;
