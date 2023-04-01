import React, { useState } from 'react';
import './App.css';
import PhoneSelector from "./components/PhoneSelector";
import Tree from "./components/Tree";
import {TreeItem} from "./components/Tree/type";
import DataControl from "./components/DataControl";
import store from "./store";
import {Provider} from "react-redux";
import ControlBar from "./components/ControlBar";

function App() {
    const [treeData, setTreeData] = useState<TreeItem[]>([{
        title: '根结点',
        key: '0-0',
        children: [{
            title: '根结点2',
            key: '1-0',
            children: []
        }]
    }])
    const handleDrap = (info: any) => {
        console.log(info)
    }
    const onTodo = () => {}
    return (
        <Provider store={store}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <Tree />
                <PhoneSelector />
                <ControlBar />
            </div>
            <DataControl onExportImage={onTodo} onImportTemplate={onTodo} onExportTemplate={onTodo} />
        </Provider>
    );
}

export default App;
