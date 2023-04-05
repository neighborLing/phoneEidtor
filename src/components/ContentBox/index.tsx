import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import './index.less';
import store from '../../store/index'
import {useSelector} from "react-redux";
import {IPosition} from '../../store/index.d';

const cls = 'content-box';

interface IProps {
    nodeType: string;
    children: IProps[];
    position?: IPosition
    boxKey: string
    zIndex?: number
}

function initPosition(position: IPosition | undefined) {
    const {width = 100, height = 100, left = 0, top = 0, remote = 0, background = '', ratio = 1} = position || {};

    return {width, height, left, top, remote, background, ratio};
}

let mouseEnterPosition = {
    x: 0,
    y: 0,
    beforeLeft: 0,
    beforeTop: 0,
}

const ContentBox = (props: IProps) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const {children, nodeType, position, boxKey: key, zIndex = 1} = props;
    const defaultPosition = initPosition(position)
    const [curPosition, setCurrentPosition] = React.useState<IPosition>(defaultPosition);
    const {contentBoxKey, position: boxPosition} = useSelector(state => state.contentBox);

    const setContentBoxKey = (e) => {
        e.stopPropagation()
        if (contentBoxKey === key) return;
        // 阻止冒泡事件
        store.dispatch({
            type: 'setContentBoxKey',
            payload: key
        });
        // store.dispatch({
        //     type: 'setPosition',
        //     payload: defaultPosition
        // })
    }

    useEffect(() => {
        if (contentBoxKey === key) {
            store.dispatch({
                type: 'setPosition',
                payload: defaultPosition
            })
        }
    }, [contentBoxKey])

    useEffect(() => {
        const positionData = contentBoxKey === key ? boxPosition : defaultPosition;

        setCurrentPosition(initPosition(positionData))


    }, [contentBoxKey, boxPosition])

    const selected = useMemo(() => {
        return key === contentBoxKey;
    }, [contentBoxKey])

    const handleMouseDown = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        if (boxRef.current) {
            // 记录鼠标按下时的位置
            mouseEnterPosition = {
                x: e.clientX,
                y: e.clientY,
                beforeLeft: boxPosition.left,
                beforeTop: boxPosition.top,
                // beforeLeft: boxPosition.left,
                // beforeTop: boxPosition.top,
                // x: e.clientX - boxRef.current.offsetLeft,
                // y: e.clientY - boxRef.current.offsetTop
            }
            console.log('mouse down', e.clientX, e.clientY)
        }
    };

    const handleMouseMove = useCallback((e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return
        if (boxRef.current) {
            // 鼠标在屏幕中的位置可以使用
            const newX = +mouseEnterPosition.beforeLeft + e.clientX - +mouseEnterPosition.x;
            const newY = +mouseEnterPosition.beforeTop + e.clientY - +mouseEnterPosition.y;
            store.dispatch({
                type: 'setPosition',
                payload: {...boxPosition, left: newX, top: newY},
            });
        }
    }, [boxPosition])

    const handleMouseUp = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    // onMouseDown={handleMouseDown}
    return <div ref={boxRef} className={[cls, selected ? `${cls}-selected` : ''].join(' ')}
                onMouseDown={handleMouseDown}
                onClick={setContentBoxKey} style={{
        width: `${/[^0-9\.-]/.test(curPosition.width + '') ? curPosition.width : curPosition.width + 'px'}`,
        height: `${/[^0-9\.-]/.test(curPosition.height + '') ? curPosition.height : curPosition.height + 'px'}`,
        left: `${/[^0-9\.-]/.test(curPosition.left + '') ? curPosition.left : curPosition.left + 'px'}`,
        top: `${/[^0-9\.-]/.test(curPosition.top + '') ? curPosition.top : curPosition.top + 'px'}`,
        transform: `rotate(${curPosition.remote}deg)`,
        background: curPosition.background,
        backgroundSize: '100% 100%',
        // transition: 'all 0.05s',
        zIndex
    }}>
        <div>
            {
                children.map((child: IProps) => <ContentBox {...child} boxKey={child.key}/>)
            }
        </div>
    </div>;
}

export default ContentBox;