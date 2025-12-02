import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Space, Typography, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement profile update API call
      console.log('Profile update values:', values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement password change API call
      console.log('Password change values:', values);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>Profile</Title>

        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" align="center" style={{ width: '100%', marginBottom: 24 }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>{user?.email}</Title>
              <Text type="secondary">Member since {new Date().toLocaleDateString()}</Text>
            </div>
          </Space>

          <Divider>Account Information</Divider>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={{
              email: user?.email,
            }}
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email Address" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Change Password">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                { required: true, message: 'Please enter your current password!' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password (min 6 characters)" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmNewPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
