import { LockOutlined, SafetyCertificateOutlined, ScanOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { showSuccess } from '../api/http';
import { useAuth } from '../auth/AuthProvider';

const schema = z.object({
  username: z.string().min(2, '请输入用户名'),
  password: z.string().min(6, '请输入至少 6 位密码'),
});

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleFinish = async (values: { username: string; password: string }) => {
    const result = schema.safeParse(values);
    if (!result.success) return;
    setLoading(true);
    try {
      await login(values.username, values.password);
      showSuccess('登录成功');
      navigate(from, { replace: true });
    } catch {
      // 统一错误提示由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="auth-visual">
          <div className="auth-badge">工业特种设备安全台账</div>
          <Typography.Title>气瓶从入库到责任闭环，全过程可追踪</Typography.Title>
          <Typography.Paragraph>
            面向仓库、安全、巡检和管理角色，统一记录编码建档、流转、巡检、维修和预警处置过程。
          </Typography.Paragraph>
          <div className="auth-metrics">
            <div>
              <strong>30天</strong>
              <span>巡检完成率追踪</span>
            </div>
            <div>
              <strong>全链路</strong>
              <span>责任轨迹留存</span>
            </div>
            <div>
              <strong>实时</strong>
              <span>异常预警闭环</span>
            </div>
          </div>
          <div className="auth-flow">
            <span>入库建档</span>
            <i />
            <span>出库流转</span>
            <i />
            <span>巡检记录</span>
            <i />
            <span>维修留痕</span>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <Space className="auth-form-title" direction="vertical" size={8}>
              <SafetyCertificateOutlined />
              <Typography.Title level={2}>登录工作台</Typography.Title>
              <Typography.Text>进入气瓶流转与安全巡检管理后台</Typography.Text>
            </Space>
            <Form layout="vertical" size="large" onFinish={handleFinish} requiredMark="optional" autoComplete="off">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" autoComplete="username" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" autoComplete="current-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} icon={<ScanOutlined />}>
                登录系统
              </Button>
              <div className="auth-extra">
                <span>还没有账号？</span>
                <Link to="/register">申请注册</Link>
              </div>
            </Form>
          </div>
        </section>
      </div>
    </div>
  );
};

