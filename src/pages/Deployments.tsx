import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Empty, Space, Typography, Table, Tag, Modal, Form, Input, Select, Switch, message, Tooltip } from 'antd';
import { PlusOutlined, RocketOutlined, CopyOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { deploymentsService } from '../services/deployments.service';
import { appsService, type App } from '../services/apps.service';
import type { Deployment } from '../services/deployments.service';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { Option} = Select;

export const Deployments: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);

  const fetchDeployments = async () => {
    try {
      setFetchLoading(true);
      const data = await deploymentsService.findAll();
      setDeployments(data);
    } catch (error) {
      message.error('Failed to fetch deployments');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const data = await appsService.findAll();
      setApps(data);
    } catch (error) {
      message.error('Failed to fetch apps');
    }
  };

  useEffect(() => {
    fetchDeployments();
    fetchApps();
  }, []);

  const handleCreateDeployment = () => {
    setEditingDeployment(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleEdit = (deployment: Deployment) => {
    setEditingDeployment(deployment);
    setIsModalOpen(true);
    form.setFieldsValue({
      appName: deployment.appName,
      deploymentName: deployment.deploymentName,
      version: deployment.version,
      description: deployment.description,
      mandatory: deployment.mandatory,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingDeployment(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingDeployment) {
        // Update existing deployment
        await deploymentsService.update(editingDeployment.id, values);
        message.success('Deployment updated successfully');
      } else {
        // Create new deployment
        await deploymentsService.create(values);
        message.success('Deployment created successfully');
      }
      setIsModalOpen(false);
      setEditingDeployment(null);
      form.resetFields();
      await fetchDeployments(); // Refresh the list
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${editingDeployment ? 'update' : 'create'} deployment`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deploymentsService.delete(id);
      message.success('Deployment deleted successfully');
      await fetchDeployments(); // Refresh the list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete deployment');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Deployment key copied to clipboard');
  };

  const columns: ColumnsType<Deployment> = [
    {
      title: 'App Name',
      dataIndex: 'appName',
      key: 'appName',
    },
    {
      title: 'Deployment',
      dataIndex: 'deploymentName',
      key: 'deploymentName',
    },
    {
      title: 'Deployment Key',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => {
        if (!key) {
          return <Tag color="orange">No key</Tag>;
        }
        return (
          <Space>
            <code style={{ fontSize: '11px' }}>{key.substring(0, 20)}...</code>
            <Tooltip title="Copy deployment key">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(key)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Active') color = 'green';
        if (status === 'Disabled') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Mandatory',
      dataIndex: 'mandatory',
      key: 'mandatory',
      render: (mandatory: boolean) => (
        <Tag color={mandatory ? 'orange' : 'default'}>
          {mandatory ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/packages?deploymentId=${record.id}`)}
          >
            Packages
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>Deployments</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDeployment}>
            Create New Deployment
          </Button>
        </Space>

        {deployments.length === 0 ? (
          <Card>
            <Empty
              image={<RocketOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Paragraph strong>No deployments yet</Paragraph>
                  <Paragraph type="secondary">
                    Create a deployment to start pushing updates to your users
                  </Paragraph>
                </div>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDeployment}>
                Create Your First Deployment
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={deployments}
              rowKey="id"
              loading={fetchLoading}
            />
          </Card>
        )}

        <Card title="About Deployments" style={{ marginTop: 16 }}>
          <Paragraph>
            Deployments represent different release channels for your app (e.g., Production, Staging).
          </Paragraph>
          <Paragraph strong>Key features:</Paragraph>
          <ul>
            <li>Deploy updates to specific user segments</li>
            <li>Roll back deployments if issues occur</li>
            <li>Set updates as mandatory or optional</li>
            <li>Track deployment metrics and adoption rates</li>
          </ul>
        </Card>

        <Modal
          title={editingDeployment ? "Edit Deployment" : "Create New Deployment"}
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
              rules={[{ required: true, message: 'Please select an app!' }]}
            >
              <Select
                placeholder="Select an app"
                showSearch
                optionFilterProp="children"
                notFoundContent={apps.length === 0 ? "No apps found. Please create an app first." : "No matching apps"}
              >
                {apps.map((app) => (
                  <Option key={app.id} value={app.appName}>
                    {app.appName} ({app.platform})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Deployment Name"
              name="deploymentName"
              rules={[{ required: true, message: 'Please enter a deployment name!' }]}
            >
              <Input placeholder="e.g., Production, Staging" />
            </Form.Item>

            <Form.Item
              label="Version"
              name="version"
              rules={[{ required: true, message: 'Please enter a version!' }]}
            >
              <Input placeholder="e.g., 1.0.0" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={3} placeholder="Describe this deployment..." />
            </Form.Item>

            <Form.Item
              label="Mandatory Update"
              name="mandatory"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingDeployment ? 'Update Deployment' : 'Create Deployment'}
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
