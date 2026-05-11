import { LockOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { http, showSuccess } from '../api/http';
import { useAuth } from '../auth/AuthProvider';
import { PageHeader } from '../components/PageHeader';
import { cleanPayload } from '../utils/form';

export const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    profileForm.setFieldsValue(user);
  }, [user, profileForm]);

  const saveProfile = async () => {
    const values = await profileForm.validateFields();
    setLoading(true);
    try {
      const nextUser = await http.put<any, any>('/auth/me', cleanPayload(values));
      setUser(nextUser);
      showSuccess('个人资料已更新');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    const values = await passwordForm.validateFields();
    setLoading(true);
    try {
      await http.put('/auth/me/password', values);
      passwordForm.resetFields();
      showSuccess('密码已更新');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="个人中心" description="维护个人联系信息和登录密码，保存后页面顶部信息会同步更新。" />
      <div className="profile-grid">
        <Card className="profile-card">
          <Space direction="vertical" size={4} className="profile-title">
            <UserOutlined />
            <Typography.Title level={4}>基础资料</Typography.Title>
          </Space>
          <Form form={profileForm} layout="vertical" requiredMark className="profile-form">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }]}>
              <Input placeholder="可选，填写时需为 11 位手机号" />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
              <Input placeholder="可选，填写时需为正确邮箱" />
            </Form.Item>
            <Form.Item name="remark" label="备注" className="profile-wide">
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={saveProfile}>
              保存资料
            </Button>
          </Form>
        </Card>
        <Card className="profile-card">
          <Space direction="vertical" size={4} className="profile-title">
            <LockOutlined />
            <Typography.Title level={4}>修改密码</Typography.Title>
          </Space>
          <Form form={passwordForm} layout="vertical" requiredMark className="profile-form single">
            <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '新密码至少 6 位' }]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={savePassword}>
              更新密码
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

