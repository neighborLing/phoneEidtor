import React, {useEffect, useState} from 'react';
import './App.css';
import PhoneSelector from "./components/PhoneSelector";
import Tree from "./components/Tree";
import {TreeItem} from "./components/Tree/type";
import DataControl from "./components/DataControl";
import store, {addZIndex} from "./store";
import {Provider} from "react-redux";
import ControlBar from "./components/ControlBar";
import axios from "axios";

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
    const handleDrap = async (info: any) => {
        console.log(info)
    }
    const fetchTree = async () => {
        const tree = await axios.get('http://localhost:3000/tree/content');
        console.log('tree', tree)
    }
    const fetchPhone = async () => {
        const phones = await axios.get('http://localhost:3000/phones/content');
        console.log('phones', phones)
        store.dispatch({
            type: 'updatePhones2',
            payload: phones.data
        })
    }
    const fetchTemplate = async () => {
        const data = await axios.get('http://localhost:3000/trees/content');
        store.dispatch({
            type: 'updateLayoutTreeTemplates2',
            payload: data.data
        })
    }
    const onTodo = () => {}
    useEffect(() => {
        // fetchTree()
        fetchPhone()
        fetchTemplate()
    }, [])
    return (
        <Provider store={store}>
            <DataControl onExportImage={onTodo} onImportTemplate={onTodo} onExportTemplate={onTodo} />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <Tree />
                <PhoneSelector />
                <ControlBar />
            </div>
        </Provider>
    );
}

export default App;
