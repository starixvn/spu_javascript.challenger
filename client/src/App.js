import React, { useState, useEffect } from 'react';
import { Input, Button, Table } from 'antd'; // Assuming you want to use Ant Design Table
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

function App() {
  const isDev = false;
  const url = isDev ? 'http://localhost:3001' : '';

  const [chlId, setChlId] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(url + '/getChallenges');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChlIdChange = (event) => {
    setChlId(event.target.value);
  };

  const handleSetChallenge = async () =>{
    try {
      await axios.get(url + '/setChallenge/' + chlId);
      setChlId('');
      toast.success('Successfully set challenge !!!');
    } catch (error) {
      toast.error('Error setting challenge:', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 20,
    },
    {
      title: 'Function',
      dataIndex: 'func',
      key: 'func',
      width: 100,
    },
    {
      title: 'Obfuscated',
      dataIndex: 'obfuscated',
      key: 'obfuscated',
      ellipsis: true,
      width: 150,
    },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <div className='js-chl-setting'>
          <label>Challenge Id:</label>
          <Input type="text" name="chlId" placeholder="1,2,3" value={chlId} onChange={handleChlIdChange}/>

          <Button type="primary" block onClick={handleSetChallenge}>
            Set Challenge
          </Button>
        </div>
        
        <div className='data-table'>
          <h5 style={{float:'left'}}>Challenges</h5>
          <Table dataSource={data} columns={columns} />
        </div>
      </header>
      <ToastContainer />
    </div>
  );
}

export default App;