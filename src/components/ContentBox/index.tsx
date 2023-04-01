import React, {useEffect, useMemo} from 'react';
import './index.less';
import store from '../../store/index'
import {useSelector} from "react-redux";
const cls  = 'content-box';

interface IPosition {
    width: number
    height: number
    left: number
    top: number
    remote: number
    background: string
}

interface IProps {
    nodeType: string;
    children: IProps[];
    position?: IPosition
    boxKey: string
}

const ContentBox = (props: IProps) => {
    const { children, nodeType, position, boxKey: key } = props;
    const { width = 100, height = 100, left = 100, top = 100, remote = 0, background = '' } = position || {};
    const [curPosition, setCurrentPosition] = React.useState<IPosition>({ width, height, left, top, remote, background });
    const { contentBoxKey, position: boxPosition } = useSelector(state => state.contentBox);

    const setContentBoxKey = () => {
        store.dispatch({
            type: 'setContentBoxKey',
            payload: key
        });
        store.dispatch({
            type: 'setPosition',
            payload: position
        })

    }

    useEffect(() => {
        const positionData = contentBoxKey === key ? boxPosition : position;
        const { width = 100, height = 100, left = 100, top = 100, remote = 0, background = '' } = positionData || {};

        setCurrentPosition({
            width,
            height,
            left,
            top,
            remote,
            background
        })

        console.log('boxPosition change')

    }, [contentBoxKey, boxPosition])

    const selected = useMemo(() => {
        return key === contentBoxKey;
    }, [contentBoxKey])

    return <div className={[cls, selected ? `${cls}-selected` : '' ].join(' ')} onClick={setContentBoxKey} style={{
        width: `${curPosition.width}px`,
        height: `${curPosition.height}px`,
        left: `${curPosition.left}px`,
        top: `${curPosition.top}px`,
        transform: `rotate(${curPosition.remote}deg)`,
        background: curPosition.background
    }}>ContentBox</div>;
}

export default ContentBox;