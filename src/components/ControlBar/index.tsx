import React, {useEffect} from "react";
import { Form, Input, Button } from "antd";
import './index.less'
import { IPosition } from "../../store/index.d";
import {useSelector} from "react-redux";
import store from "../../store/index";
import {findCurrentNode} from "../../utils/tree";
import _ from 'lodash';

const defaultValue = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    remote: 0,
    background: ''
}

const MyForm: React.FC = () => {
    const [form] = Form.useForm();
    // const { contentBoxKey, position } = store.getState().contentBox;
    const {contentBoxKey, position} = useSelector((state) => state.contentBox);
    const {tree} = useSelector((state) => state.trees);
    const [initialValues, setInitialValues] = React.useState<IPosition>(defaultValue);

    useEffect(() => {
        form.setFieldsValue(position);
    }, [position])

    useEffect(() => {
        form.setFieldsValue(position);
    }, [contentBoxKey])

    const onValuesChange = (values: IPosition) => {
        const { contentBoxKey, position } = store.getState().contentBox;
        const payload = {
            ...position,
            ...values
        }
        console.log('payload', payload)
        store.dispatch({
            type: 'setPosition',
            payload
        });
    };

    const submitChange = () => {
        const currentNode = findCurrentNode(tree, contentBoxKey);
        console.log('tree', tree)
        console.log('currentNode', currentNode)
        if (currentNode) {
            const values = form.getFieldsValue();
            // @ts-ignore
            currentNode.position = values
            store.dispatch({
                type: 'updateLayoutTree',
                payload: _.cloneDeep(tree)
            })
            store.dispatch({
                type: 'setContentBoxKey',
                payload: ''
            })
        }
    }

    return (
        <Form form={form} initialValues={initialValues} onValuesChange={onValuesChange}>
            <Form.Item label="宽度" name="width">
                <Input type="number" />
            </Form.Item>

            <Form.Item label="高度" name="height">
                <Input type="number" />
            </Form.Item>

            <Form.Item label="左边距" name="left">
                <Input type="number" />
            </Form.Item>

            <Form.Item label="上边距" name="top">
                <Input type="number" />
            </Form.Item>

            <Form.Item label="旋转角度" name="remote">
                <Input type="number" />
            </Form.Item>

            <Form.Item label="背景颜色" name="background">
                <Input />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" onClick={submitChange}>
                    提交
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MyForm;
