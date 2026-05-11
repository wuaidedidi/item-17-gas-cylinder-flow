import { ArrowLeftOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { showError, showSuccess } from '../api/http';
import { useAuth } from '../auth/AuthProvider';
import { cleanPayload } from '../utils/form';

const schema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  password: z.string().min(6, '密码至少 6 个字符'),
  name: z.string().min(2, '姓名至少 2 个字符'),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确').optional().or(z.literal('')),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
});

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async (values: Record<string, any>) => {
    const result = schema.safeParse(values);
    if (!result.success) {
      showError(result.error.issues[0]?.message || '表单填写不完整');
      return;
    }
    setLoading(true);
    try {
      await register(cleanPayload(values));
      showSuccess('注册成功，请登录');
      navigate('/login');
    } catch {
      // 统一错误提示由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <section className="auth-visual">
          <div className="auth-badge">账号申请</div>
          <Typography.Title>注册后默认进入普通用户权限</Typography.Title>
          <Typography.Paragraph>
            普通用户可进行安全看板查看和责任追踪查询，管理员可在用户管理中分配仓库、安全或巡检角色。
          </Typography.Paragraph>
          <div className="auth-flow compact">
            <span>提交资料</span>
            <i />
            <span>默认权限</span>
            <i />
            <span>管理员分配</span>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <Space className="auth-form-title" direction="vertical" size={8}>
              <UserAddOutlined />
              <Typography.Title level={2}>创建账号</Typography.Title>
              <Typography.Text>用于责任追踪和安全台账协作</Typography.Text>
            </Space>
            <Form layout="vertical" onFinish={handleFinish} requiredMark size="large" autoComplete="off">
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item name="phone" label="手机号">
                <Input placeholder="可选，填写时需为 11 位手机号" />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="可选，填写时需为正确邮箱" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} icon={<UserAddOutlined />}>
                提交注册
              </Button>
              <div className="auth-extra">
                <Link to="/login">
                  <ArrowLeftOutlined /> 返回登录
                </Link>
              </div>
            </Form>
          </div>
        </section>
      </div>
    </div>
  );
};

