import React, { useState, useEffect } from 'react';
import { Input, Button, Table } from 'antd'; // Assuming you want to use Ant Design Table
import axios from 'axios';
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
      console.log('Successfully set challenge');
    } catch (error) {
      console.error('Error setting challenge:', error);
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Function',
      dataIndex: 'func',
      key: 'func',
    },
    {
      title: 'Obfuscated',
      dataIndex: 'obfuscated',
      key: 'obfuscated',
    },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <div className='js-chl-setting'>
          <h1>Js Challenge</h1>
          <label>
            Challenge Id: 
            <Input type="text" name="chlId" placeholder="1,2,3" value={chlId} onChange={handleChlIdChange}/>
          </label>
          <Button type="primary" block onClick={handleSetChallenge}>
            Set Challenge
          </Button>
        </div>
        
        <div className='data-table'>
          <h2 style={{float:'left'}}>Challenges</h2>
          <Table dataSource={data} columns={columns} />
        </div>
      </header>
    </div>
  );
}

export default App;