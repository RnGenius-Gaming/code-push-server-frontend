import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Empty, Spin, message, Table, Tag } from 'antd';
import {
  AppstoreOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  MobileOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { appsService } from '../services/apps.service';
import { deploymentsService } from '../services/deployments.service';
import { packagesService, type Package } from '../services/packages.service';
import { metricsService } from '../services/metrics.service';
import type { MetricsSummary } from '../types/metrics';

const { Title, Paragraph } = Typography;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalApps, setTotalApps] = useState(0);
  const [totalDeployments, setTotalDeployments] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [recentPackages, setRecentPackages] = useState<Package[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(null);
  const [lastDeployDate, setLastDeployDate] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch counts in parallel
      const [apps, deployments, packages] = await Promise.all([
        appsService.findAll(),
        deploymentsService.findAll(),
        packagesService.findAll(),
      ]);

      setTotalApps(apps.length);
      setTotalDeployments(deployments.length);
      setTotalPackages(packages.length);

      // Sort packages by creation date and get most recent
      const sortedPackages = [...packages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentPackages(sortedPackages.slice(0, 5));

      if (sortedPackages.length > 0) {
        setLastDeployDate(sortedPackages[0].createdAt);
      }

      // Fetch metrics summary
      try {
        const metrics = await metricsService.getMetricsSummary();
        setMetricsSummary(metrics);
      } catch (error: any) {
        // Metrics might not be available yet, that's ok
        console.log('No metrics available yet');
      }
    } catch (error: any) {
      message.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const recentPackagesColumns = [
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
      title: 'Status',
      dataIndex: 'isDisabled',
      key: 'isDisabled',
      render: (isDisabled: boolean) => (
        <Tag color={isDisabled ? 'red' : 'green'}>
          {isDisabled ? 'Disabled' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const hasData = totalApps > 0 || totalDeployments > 0 || totalPackages > 0;

  return (
    <DashboardLayout>
      <div>
        <Title level={2}>Welcome to CodePush Server</Title>
        <Paragraph>
          Welcome back, <strong>{user?.email}</strong>! This is your CodePush Server dashboard.
        </Paragraph>

        {/* Primary Statistics */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Apps"
                value={totalApps}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Deployments"
                value={totalDeployments}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Packages"
                value={totalPackages}
                prefix={<CloudUploadOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Metrics Statistics (if available) */}
        {metricsSummary && (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Devices"
                  value={metricsSummary.activeDevices}
                  prefix={<MobileOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  {metricsSummary.uniqueDevices} unique devices total
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Downloads"
                  value={metricsSummary.totalDownloads}
                  prefix={<DownloadOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Successful Installs"
                  value={metricsSummary.totalInstalls}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Last Activity"
                  value={
                    metricsSummary.lastReportedAt
                      ? new Date(metricsSummary.lastReportedAt).toLocaleString()
                      : 'Never'
                  }
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Packages */}
        {recentPackages.length > 0 && (
          <Card
            title="Recent Packages"
            style={{ marginTop: 24 }}
          >
            <Table
              columns={recentPackagesColumns}
              dataSource={recentPackages}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Getting Started (shown when no data) */}
        {!hasData && (
          <Card
            title="Getting Started"
            style={{ marginTop: 24 }}
          >
            <Empty
              description={
                <span>
                  No apps yet. Create your first app to get started with CodePush!
                </span>
              }
            />
            <div style={{ marginTop: 16 }}>
              <Paragraph>
                <strong>Next steps:</strong>
              </Paragraph>
              <ul>
                <li>Create your first app in the Apps section</li>
                <li>Set up a deployment (e.g., Production, Staging)</li>
                <li>Integrate CodePush into your React Native app</li>
                <li>Upload your first package and deploy updates!</li>
              </ul>
            </div>
          </Card>
        )}

        {/* Quick Stats Summary (when there's data) */}
        {hasData && (
          <Card
            title="System Overview"
            style={{ marginTop: 24 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Paragraph>
                  <strong>Last Package Deployed:</strong>{' '}
                  {lastDeployDate ? new Date(lastDeployDate).toLocaleString() : 'Never'}
                </Paragraph>
                <Paragraph>
                  <strong>Total Apps:</strong> {totalApps}
                </Paragraph>
                <Paragraph>
                  <strong>Total Deployments:</strong> {totalDeployments}
                </Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph>
                  <strong>Total Packages:</strong> {totalPackages}
                </Paragraph>
                {metricsSummary && (
                  <>
                    <Paragraph>
                      <strong>Active Installations:</strong> {metricsSummary.activeDevices}
                    </Paragraph>
                    <Paragraph>
                      <strong>Success Rate:</strong>{' '}
                      {metricsSummary.totalDownloads > 0
                        ? `${Math.round(
                            (metricsSummary.totalInstalls / metricsSummary.totalDownloads) * 100
                          )}%`
                        : 'N/A'}
                    </Paragraph>
                  </>
                )}
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
