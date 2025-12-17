import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  InputNumber,
  Switch,
  Upload,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Alert,
  Descriptions,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  InboxOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  StopOutlined,
  CheckOutlined,
  DeleteOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { packagesService, type Package } from '../services/packages.service';
import { deploymentsService, type Deployment } from '../services/deployments.service';
import { metricsService } from '../services/metrics.service';
import type { PackageMetrics } from '../types/metrics';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

export const Packages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const deploymentIdFilter = searchParams.get('deploymentId');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string>('');
  const [packageMetrics, setPackageMetrics] = useState<Record<string, PackageMetrics>>({});
  const [metricsLoading, setMetricsLoading] = useState<Record<string, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const fetchPackages = async () => {
    try {
      setFetchLoading(true);
      const data = await packagesService.findAll();
      setPackages(data);
    } catch (error) {
      message.error('Failed to fetch packages');
    } finally {
      setFetchLoading(false);
    }
  };

  // Filter packages based on deploymentId query param
  const filteredPackages = deploymentIdFilter
    ? packages.filter(pkg => pkg.deployment === deploymentIdFilter)
    : packages;

  // Find the deployment name for the filter
  const filterDeployment = deployments.find(d => d.id === deploymentIdFilter);

  const clearFilter = () => {
    setSearchParams({});
  };

  const fetchDeployments = async () => {
    try {
      const data = await deploymentsService.findAll();
      setDeployments(data);
    } catch (error) {
      message.error('Failed to fetch deployments');
    }
  };

  const fetchPackageMetrics = async (packageId: string) => {
    try {
      setMetricsLoading(prev => ({ ...prev, [packageId]: true }));
      const metrics = await metricsService.getPackageMetrics(packageId);
      setPackageMetrics(prev => ({ ...prev, [packageId]: metrics }));
    } catch (error: any) {
      // Only show error if it's not a 404 (no metrics yet)
      if (error.response?.status !== 404) {
        console.error('Failed to fetch metrics for package:', packageId, error);
      }
    } finally {
      setMetricsLoading(prev => ({ ...prev, [packageId]: false }));
    }
  };

  const handleExpand = (expanded: boolean, record: Package) => {
    if (expanded && !packageMetrics[record.id]) {
      fetchPackageMetrics(record.id);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchDeployments();
  }, []);

  const handleUploadPackage = () => {
    setIsModalOpen(true);
    // Pre-select deployment if filtering by deploymentId
    if (deploymentIdFilter) {
      form.setFieldsValue({ deploymentId: deploymentIdFilter });
      setSelectedDeploymentId(deploymentIdFilter);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setFileList([]);
    setSelectedDeploymentId('');
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please select a package file to upload');
      return;
    }

    const file = fileList[0].originFileObj as File;
    if (!file) {
      message.error('Invalid file. Please select a file again.');
      return;
    }

    setLoading(true);
    try {
      await packagesService.release(selectedDeploymentId, file, {
        appVersion: values.appVersion,
        description: values.description,
        isDisabled: values.isDisabled || false,
        isMandatory: values.isMandatory || false,
        rollout: values.rollout || 100,
      });

      message.success('Package uploaded successfully');
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      setSelectedDeploymentId('');
      await fetchPackages();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to upload package');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      await packagesService.toggleStatus(packageId);
      message.success(`Package ${currentStatus ? 'enabled' : 'disabled'} successfully`);
      await fetchPackages();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update package status');
    }
  };

  const handleDelete = async (packageId: string, label: string) => {
    try {
      await packagesService.delete(packageId);
      message.success(`Package ${label} deleted successfully`);
      await fetchPackages();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete package');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file: File) => {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
      if (!isZip) {
        message.error('You can only upload ZIP files!');
        return Upload.LIST_IGNORE;
      }
      const uploadFile: UploadFile = {
        uid: file.name,
        name: file.name,
        status: 'done',
        originFileObj: file as any,
      };
      setFileList([uploadFile]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const columns: ColumnsType<Package> = [
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => {
        const kb = (size / 1024).toFixed(2);
        return `${kb} KB`;
      },
    },
    {
      title: (
        <Tooltip title="Percentage of users who will receive this update">
          Rollout
        </Tooltip>
      ),
      dataIndex: 'rollout',
      key: 'rollout',
      render: (rollout: number) => (
        <Tooltip title={`${rollout}% of users will receive this update`}>
          {rollout}%
        </Tooltip>
      ),
    },
    {
      title: 'Mandatory',
      dataIndex: 'isMandatory',
      key: 'isMandatory',
      render: (isMandatory: boolean) => (
        <Tag color={isMandatory ? 'orange' : 'default'}>
          {isMandatory ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: (
        <Tooltip title="Active packages are served to users. Disabled packages are hidden.">
          Status
        </Tooltip>
      ),
      dataIndex: 'isDisabled',
      key: 'isDisabled',
      render: (isDisabled: boolean) => (
        <Tag color={isDisabled ? 'red' : 'green'}>
          {isDisabled ? 'Disabled' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Metrics',
      key: 'metrics',
      align: 'center' as const,
      render: (_, record) => {
        const metrics = packageMetrics[record.id];
        if (!metrics) {
          return (
            <Button
              size="small"
              type="link"
              onClick={() => fetchPackageMetrics(record.id)}
              loading={metricsLoading[record.id]}
            >
              Load Metrics
            </Button>
          );
        }
        return (
          <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
            <Tooltip title="Active devices running this version">
              <div><MobileOutlined /> {metrics.activeDevices} devices</div>
            </Tooltip>
            <Tooltip title="Total downloads">
              <div><DownloadOutlined /> {metrics.totalDownloads} downloads</div>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_, record) => {
        const handleMenuClick = ({ key }: { key: string }) => {
          console.log('Menu clicked:', key, 'Package ID:', record.id);
          switch (key) {
            case 'download':
              window.open(record.blobUrl, '_blank');
              break;
            case 'toggle':
              handleToggleStatus(record.id, record.isDisabled);
              break;
            case 'delete':
              console.log('Delete clicked, showing modal');
              if (window.confirm(`Are you sure you want to delete ${record.label}? This action cannot be undone.`)) {
                console.log('User confirmed delete');
                handleDelete(record.id, record.label);
              }
              break;
          }
        };

        const menuItems = [
          {
            key: 'download',
            label: 'Download',
            icon: <DownloadOutlined />,
          },
          {
            key: 'toggle',
            label: record.isDisabled ? 'Enable' : 'Disable',
            icon: record.isDisabled ? <CheckOutlined /> : <StopOutlined />,
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const expandedRowRender = (record: Package) => {
    const metrics = packageMetrics[record.id];
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
              onClick={() => fetchPackageMetrics(record.id)}
            >
              Load Metrics
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <Card bordered={false} style={{ backgroundColor: '#fafafa' }}>
        <Title level={5}>Package Metrics - {record.label}</Title>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Devices"
                value={metrics.activeDevices}
                prefix={<MobileOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              {metrics.adoptionRate !== undefined && (
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  {metrics.adoptionRate}% adoption rate
                </div>
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Downloads"
                value={metrics.totalDownloads}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Successful Installs"
                value={metrics.totalInstalls}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Confirmed Updates"
                value={metrics.totalConfirmed}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Descriptions title="Update Statistics" bordered column={1} size="small">
              <Descriptions.Item label="Total Rollbacks">
                <Tag color="orange" icon={<FallOutlined />}>
                  {metrics.totalRollbacks}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Failed Installs">
                <Tag color="red" icon={<StopOutlined />}>
                  {metrics.totalFailed}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Success Rate">
                {metrics.totalDownloads > 0 ? (
                  <Tag color="green" icon={<RiseOutlined />}>
                    {Math.round((metrics.totalInstalls / metrics.totalDownloads) * 100)}%
                  </Tag>
                ) : (
                  <Tag>N/A</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions title="Package Details" bordered column={1} size="small">
              <Descriptions.Item label="Package Hash">
                <Typography.Text code copyable style={{ fontSize: '11px' }}>
                  {metrics.packageHash.substring(0, 16)}...
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="App Version">
                <Tag color="blue">{metrics.appVersion}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Label">
                <Tag>{metrics.label}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>Packages</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleUploadPackage}>
            Upload Package
          </Button>
        </Space>

        {deploymentIdFilter && filterDeployment && (
          <Alert
            message={`Showing packages for: ${filterDeployment.appName} - ${filterDeployment.deploymentName}`}
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

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Packages"
                value={filteredPackages.length}
                prefix={<CloudUploadOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Active Packages"
                value={filteredPackages.filter(p => !p.isDisabled).length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Size"
                value={`${(filteredPackages.reduce((sum, p) => sum + p.size, 0) / 1024 / 1024).toFixed(2)} MB`}
              />
            </Card>
          </Col>
        </Row>

        {filteredPackages.length === 0 ? (
          <Card>
            <Empty
              image={<InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Paragraph strong>
                    {deploymentIdFilter ? 'No packages for this deployment' : 'No packages yet'}
                  </Paragraph>
                  <Paragraph type="secondary">
                    {deploymentIdFilter
                      ? 'Upload a package for this deployment to get started'
                      : 'Upload your first package to start deploying updates to your users'}
                  </Paragraph>
                </div>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleUploadPackage}>
                {deploymentIdFilter ? 'Upload Package' : 'Upload Your First Package'}
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={filteredPackages}
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

        <Card title="About Packages" style={{ marginTop: 16 }}>
          <Paragraph>
            Packages contain your JavaScript bundles and assets that will be deployed to your users.
          </Paragraph>
          <Paragraph strong>Package Features:</Paragraph>
          <ul>
            <li><strong>Upload:</strong> Upload new versions as ZIP files</li>
            <li><strong>Rollout Control:</strong> Gradually release updates by setting a percentage (e.g., 10% of users first, then increase to 100%)</li>
            <li><strong>Mandatory Updates:</strong> Force users to install critical updates immediately</li>
            <li><strong>Status Management:</strong> Enable/disable packages without deleting them. Disabled packages won't be served to users.</li>
            <li><strong>Download:</strong> Download any package version for backup or inspection</li>
            <li><strong>Delete:</strong> Permanently remove packages you no longer need (both file and database record)</li>
          </ul>
          <Paragraph strong style={{ marginTop: 16 }}>Why use Rollout?</Paragraph>
          <Paragraph type="secondary">
            Start with a small percentage (e.g., 10%) to test updates with real users before releasing to everyone.
            If issues are found, disable the package. If everything works well, increase the rollout to 100%.
          </Paragraph>
        </Card>

        <Modal
          title="Upload New Package"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Deployment"
              name="deploymentId"
              rules={[{ required: true, message: 'Please select a deployment!' }]}
            >
              <Select
                placeholder="Select deployment"
                onChange={(value) => setSelectedDeploymentId(value)}
              >
                {deployments.map((dep) => (
                  <Option key={dep.id} value={dep.id}>
                    {dep.appName} - {dep.deploymentName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="App Version (Target Binary Version)"
              name="appVersion"
              rules={[{ required: true, message: 'Please enter app version!' }]}
              extra="e.g., 1.0.0 or 1.0.x (supports semver ranges)"
            >
              <Input placeholder="1.0.0" />
            </Form.Item>

            <Form.Item
              label="Package File"
              required
              extra="Upload a ZIP file containing your JavaScript bundle and assets"
            >
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag ZIP file to upload</p>
                <p className="ant-upload-hint">
                  Upload your compiled React Native bundle as a ZIP file
                </p>
              </Dragger>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={3} placeholder="What's new in this release..." />
            </Form.Item>

            <Form.Item
              label="Rollout Percentage"
              name="rollout"
              initialValue={100}
              extra="Control what percentage of users receive this update"
            >
              <InputNumber
                min={1}
                max={100}
                style={{ width: '100%' }}
                formatter={value => `${value}%`}
                parser={(value: any) => value.replace('%', '')}
              />
            </Form.Item>

            <Form.Item
              label="Mandatory Update"
              name="isMandatory"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              label="Disabled"
              name="isDisabled"
              valuePropName="checked"
              initialValue={false}
              extra="Upload as disabled if you want to enable it later"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading} icon={<CloudUploadOutlined />}>
                  Upload Package
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
