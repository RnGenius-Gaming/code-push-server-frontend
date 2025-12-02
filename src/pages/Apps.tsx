import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Empty, Space, Typography, Modal, Form, Input, Select, message, Table } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { appsService } from '../services/apps.service';
import type { App } from '../services/apps.service';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const Apps: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setFetchLoading(true);
      const data = await appsService.findAll();
      setApps(data);
    } catch (error) {
      message.error('Failed to fetch apps');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await appsService.create(values);
      message.success('App created successfully');
      setIsModalOpen(false);
      form.resetFields();
      await fetchApps(); // Refresh the list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await appsService.delete(id);
      message.success('App deleted successfully');
      await fetchApps(); // Refresh the list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete app');
    }
  };

  const columns: ColumnsType<App> = [
    {
      title: 'App Name',
      dataIndex: 'appName',
      key: 'appName',
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/deployments?appName=${encodeURIComponent(record.appName)}`)}
          >
            Deployments
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>Apps</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateApp}>
            Create New App
          </Button>
        </Space>

        {apps.length === 0 ? (
          <Card>
            <Empty
              image={<AppstoreOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Paragraph strong>No apps yet</Paragraph>
                  <Paragraph type="secondary">
                    Create your first app to start deploying updates with CodePush
                  </Paragraph>
                </div>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateApp}>
                Create Your First App
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={apps}
              rowKey="id"
              loading={fetchLoading}
            />
          </Card>
        )}

        <Card title="Getting Started" style={{ marginTop: 16 }}>
          <Paragraph>
            CodePush allows you to deploy mobile app updates directly to your users' devices.
          </Paragraph>
          <Paragraph strong>To get started:</Paragraph>
          <ol>
            <li>Create an app using the button above</li>
            <li>Install the CodePush CLI: <code>npm install -g code-push-cli</code></li>
            <li>Add CodePush to your React Native app</li>
            <li>Deploy your first update!</li>
          </ol>
        </Card>

        <Modal
          title="Create New App"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="App Name"
              name="appName"
              rules={[{ required: true, message: 'Please enter an app name!' }]}
            >
              <Input placeholder="e.g., MyApp" />
            </Form.Item>

            <Form.Item
              label="Platform"
              name="platform"
              rules={[{ required: true, message: 'Please select a platform!' }]}
            >
              <Select placeholder="Select a platform">
                <Option value="ios">iOS</Option>
                <Option value="android">Android</Option>
                <Option value="react-native">React Native</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={3} placeholder="Describe your app..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create App
                </Button>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
