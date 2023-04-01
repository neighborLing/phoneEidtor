import React, {useEffect} from 'react'
import './index.less'
import {useSelector} from "react-redux";
import ContentBox from "../ContentBox";

const cls = 'editor'
const Editor = () => {
    const { tree } = useSelector((state: any) => state.trees);
    const root = tree[0];
    const { children = [] } = root || {};

    useEffect(() => {
        console.log('tree change', tree)
    }, [tree])

    return <div className={cls}>
        {
            children.map((child: any) => <ContentBox {...child} boxKey={child.key} />)
        }
    </div>
}

export default Editor