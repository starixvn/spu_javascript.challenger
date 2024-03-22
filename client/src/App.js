import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Input, Button, Checkbox, Form, InputNumber } from 'antd';
import { EditOutlined, PlayCircleOutlined  } from '@ant-design/icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const isDev = process.env.NODE_ENV === "development";
  const url = isDev ? 'http://localhost:3001' : '';

  const [inputData, setInputData] = useState({
    chlId: '',
    numChl: ''
  });
  const [data, setData] = useState([]);
  const [settingChallenges, setSettingChallenges] = useState(null);
  const [autoRandom, setAutoRandom] = useState(false);

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');


  useEffect(() => {
    fetchData();
    fetchCurrentChallenge();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(url + '/api/getChallenges');

      const challenges = response.data.map(chl => {
        return {
          id: chl.id,
          key: chl.id,
          func: chl.func,
          obfuscated: chl.obfuscated
        }
      })
      setData(challenges);
    } catch (error) {
      console.log(error);
      toast.error('Error fetch data', error);
    }
  };

  const fetchCurrentChallenge = async () => {
    try {
      const response = await axios.get(url + '/api/getSettingChallenges');
      setSettingChallenges(response.data);
    } catch (error) {
      toast.error('Error fetch current challenge', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputData({ ...inputData, [name]: value });
  };

  const handleSetChallenge = async () =>{
    try {
      await axios.get(url + '/api/setChallenge/' + chlId);
      setInputData({ ...inputData, chlId: '' });
      fetchCurrentChallenge();
      toast.success('Successfully set challenge !!!');
    } catch (error) {
      toast.error('Error setting challenge:', error);
    }
  }

  const handleSetAutoRandom = async () =>{
    try {
      await axios.get(url + '/api/setNumberRandomChallenge/' + numChl);
      fetchCurrentChallenge();
      toast.success('Successfully set auto random !!!');
    } catch (error) {
      toast.error('Error setting challenge:', error);
    }
  }

  const onChangeCheckbox = e =>{
    setAutoRandom(e.target.checked);
  }

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const handleExecute = async (key) => {
    try {
      const row = await form.validateFields();
      toast.success(`Result execute function ${key} is : ${eval(row.func)}`);
    } catch (errInfo) {
      toast.error('Execute Failed: '+ errInfo)
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 10,
      editable: false,
    },
    {
      title: 'Function',
      dataIndex: 'func',
      key: 'func',
      id:'func',
      width: 100,
      editable: true,
      render: (text, record) => (
        <div>
          {text}
          <EditOutlined
            style={{fontSize: '15px', marginLeft: 8, cursor: 'pointer' }}
            onClick={() => edit(record)}
          />
        </div>
      ),
    },
    {
      title: 'Obfuscated',
      dataIndex: 'obfuscated',
      key: 'obfuscated',
      ellipsis: true,
      width: 150,
      editable: false,
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const {chlId, numChl} = inputData;

  return (
    <div className="App">
      <header className="App-header">
        <div className='js-chl-setting'>
          <Row gutter={[16, 16]} align="middle" className='row-filter1'>
            <Col flex="auto">
              {settingChallenges !== null && settingChallenges.NUM_CHALLENGE_IDS?.length > 0 ?
                    <label>Current Challenge Id: {settingChallenges.NUM_CHALLENGE_IDS}</label> :
                    <label>Challenges is random</label>}
            </Col>
            <Col flex="auto">
              <Input disabled={autoRandom} type="text" name="chlId" id="chlId" placeholder="1,2,3" value={chlId} onChange={handleInputChange}/>
            </Col>
            <Col flex="auto">
              <Button type="primary" block onClick={handleSetChallenge} disabled={autoRandom}>
                Set Challenge
              </Button>
            </Col>
          </Row>
          <Row gutter={[16, 16]} align="middle" className='row-filter2'>
            <Col flex="auto">
              <Checkbox onChange={onChangeCheckbox} checked={autoRandom}>Auto Random</Checkbox>
            </Col>
            <Col flex="auto">
              <Input disabled={!autoRandom} type="number" name="numChl" id='numChl' placeholder="Number of random challenge" value={numChl} onChange={handleInputChange}/>
            </Col>
            <Col flex="auto">
              <Button type="primary" block onClick={handleSetAutoRandom} disabled={!autoRandom}>
                Set Random
              </Button>
            </Col>
          </Row>
        </div>
      </header>
      <div className='data-table'>
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: (props) => (
                    <EditableCell
                      {...props}
                      handleExecute={handleExecute} 
                    />
                  )
                },
              }}
              bordered
              dataSource={data}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={{
                position:['topRight']
              }}
            />
          </Form>
        </div>
      <ToastContainer position='top-center'/>
    </div>
  );
}

const EditableCell = ({
  handleExecute,
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <>
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
            </Form.Item>
            <PlayCircleOutlined
              style={{ fontSize: '20px', marginLeft: 40, marginLeft: 20, cursor: 'pointer' }}
              onClick={() => handleExecute(record.key)}
          />
        </>
      ) : (
        children
      )}
    </td>
  );
};
export default App;