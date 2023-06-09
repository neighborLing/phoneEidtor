import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import './index.less';
import store from '../../store/index'
import {useSelector} from "react-redux";
import {IPosition} from '../../store/index.d';
import {findCurrentNode} from "../../utils/tree";
import _ from "lodash";
import ThatBox from "../ThatBox";

const cls = 'content-box';

interface IProps {
    nodeType: string;
    children: IProps[];
    position?: IPosition
    boxKey: string
    zIndex?: number
    forExport?: boolean
}

// @ts-ignore
const getAngle = (center, point) => {
    const x = point.x - center.x;
    const y = point.y - center.y;
    return Math.atan2(y, x) * 180 / Math.PI + 90;
}

function initPosition(position: IPosition | undefined) {
    const {
        width = 100,
        height = 100,
        left = 0,
        top = 0,
        remote = 0,
        background = '',
        ratio = 1,
        content = '',
        fontFamily = 'ChannelSlanted2',
        fontSize = 14,
        color = '#fff',
        lineHeight = 1,
        url = '',
        base64 = '',
        isLock = false
    } = position || {};

    return {
        width,
        height,
        left,
        top,
        remote,
        background,
        ratio,
        content,
        fontFamily,
        fontSize,
        color,
        lineHeight,
        url,
        base64,
        isLock
    }
}

let mouseEnterPosition = {
    x: 0,
    y: 0,
    beforeLeft: 0,
    beforeTop: 0,
}

const ContentBox = (props: IProps) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const {children, nodeType, position, boxKey: key, zIndex = 1, forExport = false} = props;
    const [curPosition, setCurrentPosition] = React.useState<IPosition>(position as IPosition);
    const {contentBoxKey} = useSelector(state => state.contentBox);

    const setContentBoxKey = (e) => {
        e.stopPropagation()
        if (contentBoxKey === key) return;
        // 阻止冒泡事件
        store.dispatch({
            type: 'setContentBoxKey',
            payload: key
        });
    }

    useEffect(() => {
        if (contentBoxKey === key) {
            store.dispatch({
                type: 'setPosition',
                payload: position
            })
        }
    }, [contentBoxKey])

    useEffect(() => {
        setCurrentPosition(position as IPosition)
    }, [position])

    const selected = useMemo(() => {
        return key === contentBoxKey;
    }, [contentBoxKey])

    const handleMove = (e) => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleResize = (e) => {
        document.addEventListener('mouseup', handleResizeMouseUp);
    }

    const handleMouseDown = (e) => {
        if (contentBoxKey === key) {
            e.stopPropagation();
        } else {
            return
        }

        if (boxRef.current) {
            // 判断是否为右下角的拖拽点
            const {left, top, width, height} = boxRef.current.getBoundingClientRect();
            if (e.clientX > width + left - 10 && e.clientY > height + top - 10) {
                handleResize(e)
            } else {
                handleMove(e)
            }
            // 记录鼠标按下时的位置
            mouseEnterPosition = {
                x: e.clientX,
                y: e.clientY,
                beforeLeft: position.left,
                beforeTop: position.top,
            }
        }
    };

    const handleMouseMove = (e) => {
        if (contentBoxKey !== key || curPosition.isLock) {
            return
        } else {
            e.stopPropagation();
        }
        if (boxRef.current) {
            // 鼠标在屏幕中的位置可以使用
            const newX = +mouseEnterPosition.beforeLeft + e.clientX - +mouseEnterPosition.x;
            const newY = +mouseEnterPosition.beforeTop + e.clientY - +mouseEnterPosition.y;
            const newPosition = {...position, left: newX, top: newY}
            store.dispatch({
                type: 'setPosition',
                payload: newPosition,
            });
            updateTree(newPosition as IPosition)
        }
    }

    const handleMouseUp = (e) => {
        if (contentBoxKey !== key) {
            return
        } else {
            e.stopPropagation();
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleResizeMouseUp = (e) => {
        if (contentBoxKey !== key || !boxRef.current) {
            return
        } else {
            e.stopPropagation();
        }
        const {width, height} = boxRef.current.getBoundingClientRect();
        const newPosition = {
            ...position,
            width,
            height: nodeType === 'image777' ? width * position.ratio : height
        }
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        document.removeEventListener('mouseup', handleResizeMouseUp);
        updateTree(newPosition as IPosition)
    }

    const updateTree = (position: IPosition) => {
        // 从store中获取tree
        const tree = _.cloneDeep(store.getState().trees.tree);
        const currentNode = findCurrentNode(tree, contentBoxKey);
        // @ts-ignore
        currentNode.position = position
        store.dispatch({
            type: 'updateLayoutTree',
            payload: _.cloneDeep(tree)
        })
    }

    const handleRotateMouseMove = (e) => {
        //     获取盒子中点
        if (contentBoxKey !== key || !boxRef.current) {
            return
        } else {
            e.stopPropagation()
        }
        const {left, top, width, height} = boxRef.current.getBoundingClientRect();
        const centerPoint = {
            x: left + width / 2,
            y: top + height / 2
        }
        //     获取鼠标位置
        const mousePoint = {
            x: e.clientX,
            y: e.clientY
        }
        //     获取鼠标与盒子中点的角度
        const angle = getAngle(centerPoint, mousePoint);

        const newPosition = {...position, remote: angle}
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition)
    }
    const handleRotateMouseUp = (e) => {
        if (contentBoxKey !== key || !boxRef.current) {
            return
        } else {
            e.stopPropagation();
        }
        document.removeEventListener('mousemove', handleRotateMouseMove);
        document.removeEventListener('mouseup', handleRotateMouseUp);
    }

    const handleRotateMouseDown = (e) => {
        if (contentBoxKey !== key || !boxRef.current) {
            return
        } else {
            e.stopPropagation();
        }
        document.addEventListener('mousemove', handleRotateMouseMove);
        document.addEventListener('mouseup', handleRotateMouseUp);
    }
    // const isImageBackground = children && children.length && children[0].nodeType === 'image'
    const isImageBackground = false
    const imageBackground = isImageBackground ? children[0]?.position?.background?.replace('0% 0% / 100% 100%', '50% 50% / 200% 200%') : 'none'
    const rate = forExport ? (3  / window.devicePixelRatio) : 1;
    const child = children.map((child: IProps) => <ContentBox {...child} boxKey={child.key} forExport={forExport}/>)
    const width = `${/[^0-9\.-]/.test(curPosition.width + '') ? curPosition.width : Math.ceil(+curPosition.width * rate) + 'px'}`;
    const height = `${/[^0-9\.-]/.test(curPosition.height + '') ? curPosition.height : Math.ceil(+curPosition.height * rate) + 'px'}`;
    let curBackground = isImageBackground ? imageBackground : curPosition.background;
    curBackground = curBackground;

    {
        contentBoxKey && !contentBoxKey.includes('root') && <ThatBox />
    }

    return <div ref={boxRef}
                id={selected ? 'selectedBox' : ''}
                className={[cls, selected ? `${cls}-selected` : '', isImageBackground ? 'b-filter' : ''].join(' ')}
                style={{
        width,
        height,
        left: `${/[^0-9\.-]/.test(curPosition.left + '') ? curPosition.left : Math.ceil(curPosition.left * rate) + 'px'}`,
        top: `${/[^0-9\.-]/.test(curPosition.top + '') ? curPosition.top : Math.ceil(curPosition.top * rate) + 'px'}`,
        transform: `rotate(${curPosition.remote}deg)`,
        background: !['triangle', 'lozenge', 'heart'].includes(nodeType) ? curBackground : '',
        // transition: 'all 0.05s',
        // resize: contentBoxKey === key && !curPosition.isLock && +curPosition.remote === 0 ? 'both' : 'none',
        borderRadius: ['roundedRectangle', 'rotundity'].includes(nodeType) ? nodeType === 'roundedRectangle' ? (forExport ? '60px' : '20px') : '9999px' : '0px',
        zIndex,
    }}>
        {/*{*/}
        {/*    selected && !curPosition.isLock ? <div className={'rotate-box'} onClick={handleRotateMouseDown}></div> : null*/}
        {/*}*/}
        {
            nodeType === 'triangle' ? (
                <div className={['triangle', isImageBackground ? 'b-filter' : ''].join(' ')} style={{
                    borderWidth: `0 ${width} ${height} 0`,
                    borderColor: `transparent ${curPosition.background} ${curPosition.background} transparent`
                }}>
                    {
                        child
                    }
                </div>
            ) : null
        }
        {
            nodeType === 'lozenge' ? (
                <div className={['lozenge', isImageBackground ? 'b-filter' : ''].join(' ')} style={{
                    width,
                    height,
                    background: curBackground,
                }}>
                    {
                        child
                    }
                </div>
            ) : null
        }
        {
            nodeType === 'heart' ? (
                <div className={['heart', isImageBackground ? 'b-filter' : ''].join(' ')} style={{
                    width,
                    height,
                    background: curBackground,
                }}>
                    {
                        child
                    }
                </div>
            ) : null
        }
        {
            !['triangle', 'lozenge', 'heart'].includes(nodeType) ? <div>
                {
                    child
                }
            </div> : null
        }
        {
            <span style={{
                whiteSpace: 'pre-wrap',
                fontFamily: curPosition.fontFamily,
                // @ts-ignore
                fontSize: forExport ? +curPosition.fontSize * 3 : curPosition.fontSize + 'px',
                color: curPosition.color,
                lineHeight: curPosition.lineHeight,
                overflowWrap: 'break-word',
                userSelect: 'none'
            }}>{curPosition.content}</span>
        }
        <svg>
            <clipPath id="myPath" clipPathUnits="objectBoundingBox">
                <path d="M0.5,1
      C 0.5,1,0,0.7,0,0.3
      A 0.25,0.25,1,1,1,0.5,0.3
      A 0.25,0.25,1,1,1,1,0.3
      C 1,0.7,0.5,1,0.5,1 Z"/>
            </clipPath>
        </svg>
        {
            selected && <div className='centerPoint'></div>
        }
    </div>;
}

export default ContentBox;