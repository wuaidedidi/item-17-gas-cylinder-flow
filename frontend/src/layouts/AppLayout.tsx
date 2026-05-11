import {
  AlertOutlined,
  AuditOutlined,
  BarChartOutlined,
  BuildOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ScanOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { roleLabels } from '../api/labels';
import { canAccess } from '../utils/permissions';

const menuItems = [
  { key: '/dashboard', icon: <BarChartOutlined />, label: '安全看板' },
  { key: '/cylinders', icon: <DatabaseOutlined />, label: '气瓶档案' },
  { key: '/flow', icon: <ContainerOutlined />, label: '出入库流转' },
  { key: '/inspections', icon: <SafetyCertificateOutlined />, label: '安全巡检' },
  { key: '/maintenance', icon: <BuildOutlined />, label: '维修保养' },
  { key: '/warnings', icon: <AlertOutlined />, label: '风险预警' },
  { key: '/trace', icon: <ScanOutlined />, label: '责任追踪' },
  { key: '/approvals', icon: <AuditOutlined />, label: '审批留痕' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const allowedItems = menuItems.filter((item) => canAccess(user?.role, item.key));

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className="app-shell">
      <Layout.Sider className="app-sider" width={252} breakpoint="lg" collapsedWidth={0}>
        <div className="brand-block">
          <div className="brand-mark">G</div>
          <div>
            <Typography.Title level={4}>气瓶安全追踪</Typography.Title>
            <Typography.Text>流转 · 巡检 · 责任闭环</Typography.Text>
          </div>
        </div>
        <Menu
          mode="inline"
          className="side-menu"
          selectedKeys={[location.pathname]}
          items={allowedItems}
          onClick={({ key }) => navigate(key)}
        />
      </Layout.Sider>
      <Layout className="main-layout">
        <Layout.Header className="app-header">
          <div>
            <Typography.Title level={3}>工业气瓶流转与安全巡检追踪系统</Typography.Title>
            <Typography.Text>面向仓储、流转、巡检、维修和预警闭环的安全台账平台</Typography.Text>
          </div>
          <Space size={14} className="header-user">
            <Tag color="blue">{roleLabels[user?.role || ''] || '未授权'}</Tag>
            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
              <Button className="user-button">
                <Avatar size={24} icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </Button>
            </Dropdown>
          </Space>
        </Layout.Header>
        <Layout.Content className="app-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

