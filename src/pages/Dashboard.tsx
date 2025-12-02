import React from 'react';
import { Card, Row, Col, Statistic, Typography, Empty } from 'antd';
import { AppstoreOutlined, RocketOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div>
        <Title level={2}>Welcome to CodePush Server</Title>
        <Paragraph>
          Welcome back, <strong>{user?.email}</strong>! This is your CodePush Server dashboard.
        </Paragraph>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Apps"
                value={0}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Deployments"
                value={0}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Last Deploy"
                value="Never"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

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
              <li>Install the CodePush CLI: <code>npm install -g code-push-cli</code></li>
              <li>Create your first app in the Apps section</li>
              <li>Integrate CodePush into your React Native app</li>
              <li>Deploy your first update!</li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
