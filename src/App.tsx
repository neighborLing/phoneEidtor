import React, {useEffect, useState} from 'react';
import './App.css';
import PhoneSelector from "./components/PhoneSelector";
import Tree from "./components/Tree";
import {TreeItem} from "./components/Tree/type";
import DataControl from "./components/DataControl";
import store, {addZIndex} from "./store";
import {Provider, useSelector} from "react-redux";
import ControlBar from "./components/ControlBar";
import axios from "axios";
import ThatBox from "./components/ThatBox";

window.$store = store;

function App() {
    const fetchPhone = async () => {
        const phones = await axios.get('http://47.108.29.87:3000/phones/content');
        store.dispatch({
            type: 'updatePhones',
            payload: {
                phones: phones.data,
                save: false
            }
        })
    }
    const fetchTemplate = async () => {
        const data = await axios.get('http://47.108.29.87:3000/trees/content');
        store.dispatch({
            type: 'updateLayoutTreeTemplates',
            payload: {
                treeTemplates: data.data,
                save: false
            }
        })
    }
    useEffect(() => {
        fetchPhone()
        fetchTemplate()
    }, [])
    
    return (
        <Provider store={store}>
            <DataControl />
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
