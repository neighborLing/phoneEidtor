import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import './index.less';
import store from '../../store/index'
import {useSelector} from "react-redux";
import {IPosition} from '../../store/index.d';
import {findCurrentNode} from "../../utils/tree";
import _ from "lodash";

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
        base64 = ''
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
        base64
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
    const defaultPosition = initPosition(position)
    const [curPosition, setCurrentPosition] = React.useState<IPosition>(defaultPosition);
    const {contentBoxKey, position: boxPosition} = useSelector(state => state.contentBox);
    const {tree} = useSelector((state) => state.trees);

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

    const handleMove = (e) => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleResize = (e) => {
        document.addEventListener('mouseup', handleResizeMouseUp);
    }

    const handleMouseDown = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return

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
                beforeLeft: boxPosition.left,
                beforeTop: boxPosition.top,
            }
        }
    };

    const handleMouseMove = useCallback((e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return
        if (boxRef.current) {
            // 鼠标在屏幕中的位置可以使用
            const newX = +mouseEnterPosition.beforeLeft + e.clientX - +mouseEnterPosition.x;
            const newY = +mouseEnterPosition.beforeTop + e.clientY - +mouseEnterPosition.y;
            const newPosition = {...boxPosition, left: newX, top: newY}
            store.dispatch({
                type: 'setPosition',
                payload: newPosition,
            });
            updateTree(newPosition)
        }
    }, [boxPosition])

    const handleMouseUp = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key) return
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleResizeMouseUp = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key || !boxRef.current) return
        const {width, height} = boxRef.current.getBoundingClientRect();
        const newPosition = {
            ...boxPosition,
            width,
            height: nodeType === 'image777' ? width * boxPosition.ratio : height
        }
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        document.removeEventListener('mouseup', handleResizeMouseUp);
        updateTree(newPosition)
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
        e.stopPropagation()
        //     获取盒子中点
        if (contentBoxKey !== key || !boxRef.current) return
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

        const newPosition = {...boxPosition, remote: angle}
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition)

        console.log(angle)
    }
    const handleRotateMouseUp = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key || !boxRef.current) return
        document.removeEventListener('mousemove', handleRotateMouseMove);
        document.removeEventListener('mouseup', handleRotateMouseUp);
    }

    const handleRotateMouseDown = (e) => {
        e.stopPropagation();
        if (contentBoxKey !== key || !boxRef.current) return
        document.addEventListener('mousemove', handleRotateMouseMove);
        document.addEventListener('mouseup', handleRotateMouseUp);
    }
    const isImageBackground = children && children.length && children[0].nodeType === 'image'
    const imageBackground = isImageBackground ? `${
        forExport ? children[0]?.position?.background?.replace('0% 0% / 100% 100%', '50% 50% / 200% 200%').replace(children[0]?.position?.url || '', children[0]?.position?.base64 || '') :
            children[0]?.position?.background?.replace('0% 0% / 100% 100%', '50% 50% / 200% 200%')
    }` : 'none'
    console.log('imageBackground', imageBackground)

    const rate = forExport ? 3 : 1;

    const child = children.map((child: IProps) => <ContentBox {...child} boxKey={child.key} forExport={forExport}/>)
    const width = `${/[^0-9\.-]/.test(curPosition.width + '') ? curPosition.width : +curPosition.width * rate + 'px'}`;
    const height = `${/[^0-9\.-]/.test(curPosition.height + '') ? curPosition.height : +curPosition.height * rate + 'px'}`;
    let curBackground = isImageBackground ? imageBackground : curPosition.background;
    curBackground = forExport ? curBackground.replace(curPosition?.url || '', curPosition?.base64 || '') : curBackground;
    if (forExport && isImageBackground) {
        console.log('curPosition', curPosition)
        console.log('curBackground', curBackground)
    }
    // onMouseDown={handleMouseDown}
    return <div ref={boxRef}
                className={[cls, selected ? `${cls}-selected` : '', isImageBackground ? 'b-filter' : ''].join(' ')}
                onMouseDown={handleMouseDown}
                onClick={setContentBoxKey} style={{
        width,
        height,
        left: `${/[^0-9\.-]/.test(curPosition.left + '') ? curPosition.left : curPosition.left * rate + 'px'}`,
        top: `${/[^0-9\.-]/.test(curPosition.top + '') ? curPosition.top : curPosition.top * rate + 'px'}`,
        transform: `rotate(${curPosition.remote}deg)`,
        background: !['triangle', 'lozenge', 'heart'].includes(nodeType) ? curBackground : '',
        // transition: 'all 0.05s',
        resize: contentBoxKey === key && +curPosition.remote === 0 ? 'both' : 'none',
        borderRadius: ['roundedRectangle', 'rotundity'].includes(nodeType) ? nodeType === 'roundedRectangle' ? (forExport ? '60px' : '20px') : '9999px' : '0px',
        zIndex,
    }}>
        {
            selected ? <div className={'rotate-box'} onClick={handleRotateMouseDown}></div> : null
        }
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
                <div className='heart' style={{
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
    </div>;
}

export default ContentBox;