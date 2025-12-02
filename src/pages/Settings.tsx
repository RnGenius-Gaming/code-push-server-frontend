import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Space, Typography, Divider, message, Select } from 'antd';
import { KeyOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSettingsUpdate = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement settings update API call
      console.log('Settings update values:', values);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = () => {
    // TODO: Implement API key generation
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    form.setFieldsValue({ apiKey: newKey });
    message.success('New API key generated');
  };

  return (
    <DashboardLayout>
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>Settings</Title>

        <Card title={<Space><KeyOutlined />API Configuration</Space>} style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSettingsUpdate}
            initialValues={{
              apiKey: 'sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            }}
          >
            <Form.Item
              label="API Key"
              name="apiKey"
              extra="Use this key to authenticate CLI and API requests"
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Your API Key"
                addonAfter={
                  <Button type="link" size="small" onClick={handleGenerateApiKey}>
                    Generate New
                  </Button>
                }
              />
            </Form.Item>

            <Divider />

            <Title level={5}>
              <Space><BellOutlined />Notification Settings</Space>
            </Title>

            <Form.Item
              label="Email Notifications"
              name="emailNotifications"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Deployment Success Notifications"
              name="deploymentSuccessNotifications"
              valuePropName="checked"
              initialValue={true}
              extra="Receive email when deployments are successful"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Deployment Failure Notifications"
              name="deploymentFailureNotifications"
              valuePropName="checked"
              initialValue={true}
              extra="Receive email when deployments fail"
            >
              <Switch />
            </Form.Item>

            <Divider />

            <Title level={5}>
              <Space><GlobalOutlined />General Settings</Space>
            </Title>

            <Form.Item
              label="Default Deployment Target"
              name="defaultDeploymentTarget"
              initialValue="Production"
            >
              <Select>
                <Option value="Production">Production</Option>
                <Option value="Staging">Staging</Option>
                <Option value="Development">Development</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Rollback on Error"
              name="rollbackOnError"
              valuePropName="checked"
              initialValue={false}
              extra="Automatically rollback deployments if errors are detected"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Require Approval for Production"
              name="requireApproval"
              valuePropName="checked"
              initialValue={true}
              extra="Require manual approval before deploying to production"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Settings
                </Button>
                <Button onClick={() => form.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Storage Settings" style={{ marginBottom: 16 }}>
          <Paragraph>
            Configure where your app bundles and assets are stored.
          </Paragraph>
          <Form layout="vertical">
            <Form.Item label="Storage Provider" initialValue="local">
              <Select>
                <Option value="local">Local Storage</Option>
                <Option value="s3">AWS S3</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary">Update Storage</Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Danger Zone" style={{ borderColor: '#ff4d4f' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Title level={5} style={{ color: '#ff4d4f' }}>Delete Account</Title>
              <Paragraph type="secondary">
                Once you delete your account, there is no going back. All your apps and deployments will be permanently deleted.
              </Paragraph>
              <Button danger>Delete Account</Button>
            </div>
          </Space>
        </Card>
      </div>
    </DashboardLayout>
  );
};
