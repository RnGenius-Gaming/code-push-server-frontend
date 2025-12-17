import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Button,
  Empty,
  Space,
  Typography,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tooltip,
  Alert,
  Statistic,
  Row,
  Col,
  Spin,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  RocketOutlined,
  CopyOutlined,
  MobileOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { deploymentsService } from '../services/deployments.service';
import { appsService, type App } from '../services/apps.service';
import { metricsService } from '../services/metrics.service';
import type { Deployment } from '../services/deployments.service';
import type { DeploymentMetrics } from '../types/metrics';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { Option} = Select;

export const Deployments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const appNameFilter = searchParams.get('appName');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [deploymentMetrics, setDeploymentMetrics] = useState<Record<string, DeploymentMetrics>>({});
  const [metricsLoading, setMetricsLoading] = useState<Record<string, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

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

  const fetchDeploymentMetrics = async (deploymentId: string) => {
    try {
      setMetricsLoading(prev => ({ ...prev, [deploymentId]: true }));
      const metrics = await metricsService.getDeploymentMetrics(deploymentId);
      setDeploymentMetrics(prev => ({ ...prev, [deploymentId]: metrics }));
    } catch (error: any) {
      // Only show error if it's not a 404 (no metrics yet)
      if (error.response?.status !== 404) {
        console.error('Failed to fetch metrics for deployment:', deploymentId, error);
      }
    } finally {
      setMetricsLoading(prev => ({ ...prev, [deploymentId]: false }));
    }
  };

  const handleExpand = (expanded: boolean, record: Deployment) => {
    if (expanded && !deploymentMetrics[record.id]) {
      fetchDeploymentMetrics(record.id);
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
    // Pre-select app if filtering by appName
    if (appNameFilter) {
      form.setFieldsValue({ appName: appNameFilter });
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  // Filter deployments based on appName query param
  const filteredDeployments = appNameFilter
    ? deployments.filter(dep => dep.appName === appNameFilter)
    : deployments;

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

  const expandedRowRender = (record: Deployment) => {
    const metrics = deploymentMetrics[record.id];
    const loading = metricsLoading[record.id];

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Loading metrics..." />
        </div>
      );
    }

    if (!metrics) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty description="No metrics available yet">
            <Button
              type="primary"
              size="small"
              onClick={() => fetchDeploymentMetrics(record.id)}
            >
              Load Metrics
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <Card bordered={false} style={{ backgroundColor: '#fafafa' }}>
        <Title level={5}>
          Deployment Metrics - {record.appName} / {record.deploymentName}
        </Title>

        {/* Overall Deployment Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Active Devices"
                value={metrics.totalActiveDevices}
                prefix={<MobileOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Packages"
                value={metrics.packages.length}
                prefix={<CloudUploadOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Downloads"
                value={metrics.packages.reduce((sum, p) => sum + p.totalDownloads, 0)}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Installs"
                value={metrics.packages.reduce((sum, p) => sum + p.totalInstalls, 0)}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Version Distribution */}
        {metrics.versionDistribution.length > 0 && (
          <Card title="Version Distribution" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              {metrics.versionDistribution.map((dist, index) => (
                <Col span={8} key={index}>
                  <Card size="small">
                    <Statistic
                      title={`${dist.appVersion} (${dist.packageLabel || 'native'})`}
                      value={dist.percentage}
                      suffix="%"
                      valueStyle={{ fontSize: '20px' }}
                    />
                    <Progress
                      percent={dist.percentage}
                      strokeColor={
                        dist.percentage > 70
                          ? '#52c41a'
                          : dist.percentage > 30
                          ? '#1890ff'
                          : '#faad14'
                      }
                      showInfo={false}
                      style={{ marginTop: 8 }}
                    />
                    <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                      {dist.deviceCount} devices
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Package Metrics Table */}
        {metrics.packages.length > 0 && (
          <Card title="Package Performance" size="small">
            <Table
              size="small"
              dataSource={metrics.packages}
              rowKey="packageId"
              pagination={false}
              columns={[
                {
                  title: 'Label',
                  dataIndex: 'label',
                  key: 'label',
                  render: (label: string) => <Tag color="blue">{label}</Tag>,
                },
                {
                  title: 'App Version',
                  dataIndex: 'appVersion',
                  key: 'appVersion',
                },
                {
                  title: 'Active Devices',
                  dataIndex: 'activeDevices',
                  key: 'activeDevices',
                  render: (value: number, record: any) => (
                    <div>
                      <div><MobileOutlined /> {value}</div>
                      {record.adoptionRate !== undefined && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {record.adoptionRate}% adoption
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Downloads',
                  dataIndex: 'totalDownloads',
                  key: 'totalDownloads',
                },
                {
                  title: 'Installs',
                  dataIndex: 'totalInstalls',
                  key: 'totalInstalls',
                  render: (installs: number, record: any) => {
                    const successRate =
                      record.totalDownloads > 0
                        ? Math.round((installs / record.totalDownloads) * 100)
                        : 0;
                    return (
                      <div>
                        <div>{installs}</div>
                        <Tag
                          color={successRate >= 90 ? 'green' : successRate >= 70 ? 'orange' : 'red'}
                          style={{ fontSize: '10px' }}
                        >
                          {successRate}% success
                        </Tag>
                      </div>
                    );
                  },
                },
                {
                  title: 'Confirmed',
                  dataIndex: 'totalConfirmed',
                  key: 'totalConfirmed',
                },
                {
                  title: 'Failed',
                  dataIndex: 'totalFailed',
                  key: 'totalFailed',
                  render: (failed: number) =>
                    failed > 0 ? <Tag color="red">{failed}</Tag> : <Tag>{failed}</Tag>,
                },
                {
                  title: 'Rollbacks',
                  dataIndex: 'totalRollbacks',
                  key: 'totalRollbacks',
                  render: (rollbacks: number) =>
                    rollbacks > 0 ? <Tag color="orange">{rollbacks}</Tag> : <Tag>{rollbacks}</Tag>,
                },
              ]}
            />
          </Card>
        )}
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>Deployments</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDeployment}>
            Create New Deployment
          </Button>
        </Space>

        {appNameFilter && (
          <Alert
            message={`Showing deployments for: ${appNameFilter}`}
            type="info"
            showIcon
            closable
            onClose={clearFilter}
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={clearFilter}>
                Show All
              </Button>
            }
          />
        )}

        {filteredDeployments.length === 0 ? (
          <Card>
            <Empty
              image={<RocketOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Paragraph strong>
                    {appNameFilter ? `No deployments for ${appNameFilter}` : 'No deployments yet'}
                  </Paragraph>
                  <Paragraph type="secondary">
                    {appNameFilter
                      ? 'Create a deployment for this app to start pushing updates'
                      : 'Create a deployment to start pushing updates to your users'}
                  </Paragraph>
                </div>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDeployment}>
                {appNameFilter ? 'Create Deployment' : 'Create Your First Deployment'}
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={filteredDeployments}
              rowKey="id"
              loading={fetchLoading}
              expandable={{
                expandedRowRender,
                onExpand: handleExpand,
                expandedRowKeys,
                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
              }}
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
