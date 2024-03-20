import React, { useState } from 'react';
import { Input, Button } from 'antd';
import axios from 'axios';
import './App.css'

function App() {
  const [chlId, setChlId] = useState("");

  const handleChlIdChange = (event) => {
    setChlId(event.target.value);
  };

  const handleSetChallenge = async () =>{
    await axios.get('/setChallenge/' + chlId)
    .then(response => {
      console.log('Successfully set challenge');
    })
    .catch(error => {
      console.error('Error setting challenge:', error);
    });
  }

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
        
      </header>
    </div>
  );
}

export default App;