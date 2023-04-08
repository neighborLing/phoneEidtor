import React, {useEffect, useMemo} from "react";
import {Form, Input, Button} from "antd";
import './index.less'
import {IPosition} from "../../store/index.d";
import {useSelector} from "react-redux";
import store from "../../store/index";
import {findCurrentNode} from "../../utils/tree";
import _, {isNumber} from 'lodash';
import {SketchPicker} from 'react-color';
import ImageUploader from "../ImageUploader";


const MyForm: React.FC = () => {
    const [form] = Form.useForm();
    // const { contentBoxKey, position } = store.getState().contentBox;
    const {contentBoxKey, position} = useSelector((state) => state.contentBox);
    const {tree} = useSelector((state) => state.trees);

    useEffect(() => {
        form.setFieldsValue(position);
    }, [position])

    useEffect(() => {
        form.setFieldsValue(position);
    }, [contentBoxKey])

    const onValuesChange = (values: {
        [K in keyof IPosition]?: IPosition[K]
    }) => {
        const {position} = store.getState().contentBox;
        const valueKeys = Object.keys(values);
        if (valueKeys.length === 1 && ['width', 'height'].includes(valueKeys[0]) && nodeType === 'image') {
            const field = valueKeys[0];
            const {width, height, ratio} = position;
            let newWidth = +(values.width || width);
            let newHeight = +(values.height || height);
            if (!isNumber(newWidth) || !isNumber(newHeight) || !newHeight || !newWidth) return;
            if (field === 'width') {
                // 根据宽高比ratio计算高度
                // @ts-ignore
                newHeight = +ratio * newWidth;
            } else {
                // @ts-ignore
                newWidth = newHeight / +ratio;
            }

            const payload = {
                ...position,
                width: newWidth,
                height: newHeight
            }
            store.dispatch({
                type: 'setPosition',
                payload
            });
        } else {
            const payload = {
                ...position,
                ...values
            }
            store.dispatch({
                type: 'setPosition',
                payload
            });
        }

        setTimeout(() => {
            submitChange()
        }, 200)
    };

    const nodeType = useMemo(() => {
        const currentNode = findCurrentNode(tree, contentBoxKey);
        // @ts-ignore
        return currentNode && currentNode.nodeType || '';
    }, [contentBoxKey, tree])

    const submitChange = () => {
        const currentNode = findCurrentNode(tree, contentBoxKey);
        if (currentNode) {
            const values = form.getFieldsValue();
            // @ts-ignore
            currentNode.position = values
            store.dispatch({
                type: 'updateLayoutTree',
                payload: _.cloneDeep(tree)
            })
            // store.dispatch({
            //     type: 'setContentBoxKey',
            //     payload: ''
            // })
        }
    }

    const handleImageUpload = (val) => {
        console.log(val)
        const file = val[0];
        const { width, height, url } = file;
        const ratio = height / width;

        onValuesChange({
            ratio: ratio
        })
        onValuesChange({
            background: `url("${url}") 0% 0% / 100% 100%`
        })
        onValuesChange({
            height: ratio * form.getFieldValue('width')
        })

    }

    return (
        <div className="control-bar">
            {

                    nodeType === 'image' ? <Form form={form} onValuesChange={onValuesChange}>
                    <Form.Item label="宽度" name="width">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="高度" name="height">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="左边距" name="left">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="上边距" name="top">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="旋转角度" name="remote">
                        <Input type="number"/>
                    </Form.Item>

                    <Form.Item label="图片选择" name="background">
                        <Button>
                            <ImageUploader onChange={handleImageUpload} multiple={false}/>
                        </Button>
                    </Form.Item>

                    <Form.Item label="高宽比" name="ratio" hidden>
                        <Input readOnly/>
                    </Form.Item>
                </Form> : <Form form={form} onValuesChange={onValuesChange}>
                    <Form.Item label="宽度" name="width">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="高度" name="height">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="左边距" name="left">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="上边距" name="top">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="旋转角度" name="remote">
                        <Input type="number"/>
                    </Form.Item>

                    <Form.Item label="背景颜色">
                        <SketchPicker color={form.getFieldValue('background')} onChangeComplete={(color: {
                            hex: string;
                        }) => onValuesChange({
                            background: color.hex
                        })}/>
                    </Form.Item>

                    <Form.Item label="高宽比" name="ratio" hidden>
                        <Input readOnly/>
                    </Form.Item>
                </Form>
            }
        </div>
    );
}
    ;

    export default MyForm;
