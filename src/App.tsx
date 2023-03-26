import React, { useState } from 'react';
import './App.css';
import PhoneSelector from "./components/PhoneSelector";
import Tree from "./components/Tree";
import {TreeItem} from "./components/Tree/type";
import DataControl from "./components/DataControl";
import store from "./store";
import {Provider} from "react-redux";

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
                width: '100vw',
                justifyContent: 'space-between',
            }}>

                <Tree />
                <PhoneSelector />
                <DataControl onExportImage={onTodo} onImportTemplate={onTodo} onExportTemplate={onTodo} />
            </div>
        </Provider>
    );
}

export default App;
