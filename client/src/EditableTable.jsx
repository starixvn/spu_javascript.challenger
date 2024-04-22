import { Table, Input, Form } from 'antd';
import { useState } from 'react';

const EditableTable = ({ dataSource, columns }) => {
  const [data, setData] = useState([]);

  const handleSave = (row) => {
    const newData = [...data];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setData(newData);
    }
  };

  const edit = (key) => {
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, editing: true });
      setData(newData);
    }
  };

  const cancel = (key) => {
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, editing: false });
      setData(newData);
    }
  };

  const save = (form, key) => {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row, editing: false });
        setData(newData);
        handleSave({ ...item, ...row });
      }
    });
  };

  const editForm = (record, dataIndex, title, form) => {
    const { getFieldDecorator } = form;
    return (
      <Form.Item style={{ margin: 0 }}>
        {getFieldDecorator(dataIndex, {
          rules: [{ required: true, message: `Please enter ${title}!` }],
          initialValue: record[dataIndex],
        })(<Input onPressEnter={() => save(form, record.key)} onBlur={() => save(form, record.key)} />)}
      </Form.Item>
    );
  };

  const editableColumns = columns.map((col) => {
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
        editing: record.editing,
        render: (text, record) => (
          <div onClick={() => edit(record.key)}>
            {col.dataIndex === 'func' ? (
              <Form>
                {editForm(record, col.dataIndex, col.title, record.form)}
              </Form>
            ) : (
              text
            )}
          </div>
        ),
      }),
    };
  });

  return (
    <Table
      bordered
      dataSource={dataSource}
      columns={editableColumns}
      rowClassName="editable-row"
      pagination={false}
    />
  );
};

export default EditableTable;
