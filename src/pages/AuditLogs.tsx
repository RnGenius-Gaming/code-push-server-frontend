import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Input, Select, message, Tooltip } from 'antd';
import { HistoryOutlined, SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { auditService, type AuditLog } from '../services/audit.service';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [entityFilter, setEntityFilter] = useState<string | undefined>(undefined);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.findAll();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      message.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(log =>
        log.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
        log.action.toLowerCase().includes(searchText.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchText.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Entity filter
    if (entityFilter) {
      filtered = filtered.filter(log => log.entity === entityFilter);
    }

    setFilteredLogs(filtered);
  }, [searchText, actionFilter, entityFilter, logs]);

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return 'green';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'blue';
    if (actionLower.includes('delete')) return 'red';
    if (actionLower.includes('login')) return 'cyan';
    if (actionLower.includes('logout')) return 'default';
    return 'purple';
  };

  const getEntityIcon = (entity: string) => {
    const entityLower = entity.toLowerCase();
    if (entityLower.includes('user')) return <UserOutlined />;
    if (entityLower.includes('app')) return <FileTextOutlined />;
    return <FileTextOutlined />;
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity)));

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (date: string) => {
        const dateObj = new Date(date);
        const formatted = dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return (
          <Tooltip title={dateObj.toLocaleString()}>
            <span>{formatted}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 200,
      render: (email: string) => (
        <Space>
          <UserOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      width: 120,
      render: (entity: string) => (
        <Space>
          {getEntityIcon(entity)}
          <span>{entity}</span>
        </Space>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string) => (
        <Tooltip title={details}>
          <Text type="secondary">{details || 'N/A'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (ip: string) => <Text code>{ip || 'N/A'}</Text>,
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <HistoryOutlined /> Audit Logs
            </Title>
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Track all key operations and user activities
            </Paragraph>
          </div>
        </Space>

        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap>
              <Input
                placeholder="Search logs..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="Filter by action"
                style={{ width: 180 }}
                value={actionFilter}
                onChange={setActionFilter}
                allowClear
              >
                {uniqueActions.map(action => (
                  <Option key={action} value={action}>
                    {action}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by entity"
                style={{ width: 180 }}
                value={entityFilter}
                onChange={setEntityFilter}
                allowClear
              >
                {uniqueEntities.map(entity => (
                  <Option key={entity} value={entity}>
                    {entity}
                  </Option>
                ))}
              </Select>
            </Space>
            <Text type="secondary">
              Showing {filteredLogs.length} of {logs.length} logs
            </Text>
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} logs`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Card title="About Audit Logs" style={{ marginTop: 16 }}>
          <Paragraph>
            Audit logs track all key operations performed in your CodePush server for security and compliance purposes.
          </Paragraph>
          <Paragraph strong>Tracked Operations:</Paragraph>
          <ul>
            <li><Tag color="cyan">Login</Tag> User authentication events</li>
            <li><Tag color="green">Create</Tag> New resources created (Apps, Deployments, Packages)</li>
            <li><Tag color="blue">Update</Tag> Resource modifications</li>
            <li><Tag color="red">Delete</Tag> Resource deletions</li>
            <li><Tag color="purple">Other</Tag> Package uploads, status changes, etc.</li>
          </ul>
          <Paragraph type="secondary">
            All logs include timestamp, user information, IP address, and detailed action descriptions.
          </Paragraph>
        </Card>
      </div>
    </DashboardLayout>
  );
};
