import React, {useEffect, useMemo} from 'react'
import './index.less'
import {useSelector} from "react-redux";
import ContentBox from "../ContentBox";

const cls = 'editor'
interface IProps {
    forExport?: boolean
}
const Editor = (props: IProps) => {
    const { forExport = false } = props
    const { tree } = useSelector((state: any) => state.trees);
    const children = useMemo(() => {
        const root = tree[0];
        const { children = [] } = root || {};

        return children
    }, [tree])

    return <div className={cls} id={forExport ? 'phoneEditor' : ''}>
        {
            children.map((child: any) => <ContentBox {...child} boxKey={child.key} forExport={forExport} />)
        }
    </div>
}

export default Editor