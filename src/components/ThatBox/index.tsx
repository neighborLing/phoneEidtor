import React, {useEffect, useRef} from 'react';
import './index.less';
import store from "../../store/index";
import {useSelector} from "react-redux";
import _ from "lodash";
import {findCurrentNode} from "../../utils/tree";
import {IPosition} from '../../store/index.d';

let mouseEnterPosition = {
    x: 0,
    y: 0,
    beforeLeft: 0,
    beforeTop: 0,
}

let rotating = false;

// @ts-ignore
const getAngle = (center, point) => {
    const x = point.x - center.x;
    const y = point.y - center.y;
    return Math.atan2(y, x) * 180 / Math.PI;
}

const Rectangle: React.FC = () => {
    const boxRef = useRef<HTMLDivElement>(null);
    const {position, contentBoxKey} = useSelector(state => state.contentBox);
    const [lt, setLt] = React.useState({left: 0, top: 0, remote: 0});

    useEffect(() => {
        const curBox = document.querySelector('#selectedBox');
        //    获取绝对定位
        if (!curBox) return;
        const {left, top} = curBox.getBoundingClientRect();
        setLt({left, top, remote: position.remote});
    }, [position])
    const handleTopClick = () => {
        document.addEventListener('mousemove', handleTopMouseMove);
        document.addEventListener('mouseup', handleTopMouseUp);
    };
    
    const handleTopMouseMove = (e) => {
        const { y } = mouseEnterPosition
        const diss = y - e.clientY 
        mouseEnterPosition.y = e.clientY
        position.top = position.top - diss
        position.height = position.height + diss
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };
    
    const handleTopMouseUp = (e) => {
        document.removeEventListener('mousemove', handleTopMouseMove);
        document.removeEventListener('mouseup', handleTopMouseUp);
    };

    const handleBottomClick = () => {
        document.addEventListener('mousemove', handleBottomMouseMove);
        document.addEventListener('mouseup', handleBottomMouseUp);
    };

    const handleBottomMouseMove = (e) => {
        const { y } = mouseEnterPosition
        const diss = y - e.clientY
        mouseEnterPosition.y = e.clientY
        position.height = position.height - diss
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleBottomMouseUp = (e) => {
        document.removeEventListener('mousemove', handleBottomMouseMove);
        document.removeEventListener('mouseup', handleBottomMouseUp);
    };

    const handleLeftClick = () => {
        document.addEventListener('mousemove', handleLeftMouseMove);
        document.addEventListener('mouseup', handleLeftMouseUp);
    };

    const handleLeftMouseMove = (e) => {
        const { x } = mouseEnterPosition
        const diss = x - e.clientX
        mouseEnterPosition.x = e.clientX
        position.left = position.left - diss
        position.width = position.width + diss
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleLeftMouseUp = (e) => {
        document.removeEventListener('mousemove', handleLeftMouseMove);
        document.removeEventListener('mouseup', handleLeftMouseUp);
    };

    const handleRightClick = () => {
        document.addEventListener('mousemove', handleRightMouseMove);
        document.addEventListener('mouseup', handleRightMouseUp);
    };

    const handleRightMouseMove = (e) => {
        const { x } = mouseEnterPosition
        const diss = x - e.clientX
        mouseEnterPosition.x = e.clientX
        position.width = position.width - diss
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleRightMouseUp = (e) => {
        document.removeEventListener('mousemove', handleRightMouseMove);
        document.removeEventListener('mouseup', handleRightMouseUp);
    };

    const handleTopLeftClick = () => {
        document.addEventListener('mousemove', handleTopLeftMouseMove);
        document.addEventListener('mouseup', handleTopLeftMouseUp);
    };

    const handleTopLeftMouseMove = (e) => {
        const { x, y } = mouseEnterPosition
        const dissX = x - e.clientX
        const dissY = y - e.clientY
        mouseEnterPosition.x = e.clientX
        mouseEnterPosition.y = e.clientY
        position.left = position.left - dissX
        position.width = position.width + dissX
        position.top = position.top - dissY
        position.height = position.height + dissY
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleTopLeftMouseUp = (e) => {
        document.removeEventListener('mousemove', handleTopLeftMouseMove);
        document.removeEventListener('mouseup', handleTopLeftMouseUp);
    };

    const handleTopRifhtClick = () => {
        document.addEventListener('mousemove', handleTopRightMouseMove);
        document.addEventListener('mouseup', handleTopRightMouseUp);
    };

    const handleTopRightMouseMove = (e) => {
        const { x, y } = mouseEnterPosition
        const dissX = x - e.clientX
        const dissY = y - e.clientY
        mouseEnterPosition.x = e.clientX
        mouseEnterPosition.y = e.clientY
        position.width = position.width - dissX
        position.height = position.height - dissY
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleTopRightMouseUp = (e) => {
        document.removeEventListener('mousemove', handleTopRightMouseMove);
        document.removeEventListener('mouseup', handleTopRightMouseUp);
    };

    const handleBottomLeftClick = () => {
        document.addEventListener('mousemove', handleBottomLefttMouseMove);
        document.addEventListener('mouseup', handleBottomLefttMouseUp);
    };

    const handleBottomLefttMouseMove = (e) => {
        const { x, y } = mouseEnterPosition
        const dissX = x - e.clientX
        const dissY = y - e.clientY
        mouseEnterPosition.x = e.clientX
        mouseEnterPosition.y = e.clientY
        position.left = position.left - dissX
        position.width = position.width + dissX
        position.height = position.height - dissY
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleBottomLefttMouseUp = (e) => {
        document.removeEventListener('mousemove', handleBottomLefttMouseMove);
        document.removeEventListener('mouseup', handleBottomLefttMouseUp);
    };

    const handleBottomRightClick = () => {
        document.addEventListener('mousemove', handleBottomRightMouseMove);
        document.addEventListener('mouseup', handleBottomRightMouseUp);
    };

    const handleBottomRightMouseMove = (e) => {
        const { x, y } = mouseEnterPosition
        const dissX = x - e.clientX
        const dissY = y - e.clientY
        mouseEnterPosition.x = e.clientX
        mouseEnterPosition.y = e.clientY
        position.width = position.width - dissX
        position.height = position.height - dissY
        const newPosition = _.cloneDeep(position);
        store.dispatch({
            type: 'setPosition',
            payload: newPosition,
        });
        updateTree(newPosition as IPosition)
    };

    const handleBottomRightMouseUp = (e) => {
        document.removeEventListener('mousemove', handleBottomRightMouseMove);
        document.removeEventListener('mouseup', handleBottomRightMouseUp);
    };

    const handleMouseDown = (e) => {
        e.stopPropagation();
        if (boxRef.current && !position.isLock) {
            // 判断是否为右下角的拖拽点
            handleMove(e)
            // 记录鼠标按下时的位置
            mouseEnterPosition = {
                x: e.clientX,
                y: e.clientY,
                beforeLeft: position.left,
                beforeTop: position.top,
            }
        }
    };

    const handleMove = (e) => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleMouseMove = (e) => {
        e.stopPropagation();
        if (rotating) return
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

    const handleMouseUp = (e) => {
        e.stopPropagation();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleremoteMouseDown = (e) => {
        e.stopPropagation();
        rotating = true
        document.addEventListener('mousemove', handleremoteMouseMove);
        document.addEventListener('mouseup', handleremoteMouseUp);
    }

    const handleremoteMouseUp = (e) => {
        e.stopPropagation();
        document.removeEventListener('mousemove', handleremoteMouseMove);
        document.removeEventListener('mouseup', handleremoteMouseUp);
        rotating = false
    }

    const handleremoteMouseMove = (e) => {
        e.stopPropagation()
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
    
    const handleResizeMouseDown = (e, type) => {
        e.stopPropagation();
        if (boxRef.current && !position.isLock) {
            // 记录鼠标按下时的位置
            mouseEnterPosition = {
                x: e.clientX,
                y: e.clientY,
                beforeLeft: position.left,
                beforeTop: position.top,
            }
        }
        switch (type) {
            case 'top':
                handleTopClick()
                break
            case 'bottom':
                handleBottomClick()
                break
            case 'left':
                handleLeftClick()
                break
            case 'right':
                handleRightClick()
                break
            case 'topLeft':
                handleTopLeftClick()
                break
            case 'topRight':
                handleTopRifhtClick()
                break
            case 'bottomLeft':
                handleBottomLeftClick()
                break
            case 'bottomRight':
                handleBottomRightClick()
                break
        }
    }

    return (
        <div className="rectangle" onMouseDown={handleMouseDown} ref={boxRef} style={{ width: position.width, height: position.height, left: lt.left, top: lt.top, rotate: lt.remote + 'deg'  }}>
            {/* Top */}
            <div className="circle top" onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
            {/* Bottom */}
            <div className="circle bottom" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
            {/* Left */}
            <div className="circle left" onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
            {/* Right */}
            <div className="circle right" onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
            {/* Top Left */}
            <div className="circle topLeft" onMouseDown={(e) => handleResizeMouseDown(e, 'topLeft')} />
            {/* Top Right */}
            <div className="circle topRight" onMouseDown={(e) => handleResizeMouseDown(e, 'topRight')} />
            {/* Bottom Left */}
            <div className="circle bottomLeft" onMouseDown={(e) => handleResizeMouseDown(e, 'bottomLeft')} />
            {/* Bottom Right */}
            <div className="circle bottomRight" onMouseDown={(e) => handleResizeMouseDown(e, 'bottomRight')} />
            {/* Rotation point */}
            <div className="rotationPoint" onMouseDown={handleremoteMouseDown} />
        </div>
    );
};

export default Rectangle;
