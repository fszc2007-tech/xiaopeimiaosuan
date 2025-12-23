/**
 * Admin 主布局
 */

import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  ApiOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logout } = useAuthStore();

  // 侧边栏菜单配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/users'),
    },
    {
      key: '/membership',
      icon: <CrownOutlined />,
      label: '會員管理',
      onClick: () => navigate('/membership/users'),
    },
    {
      key: '/feedbacks',
      icon: <MessageOutlined />,
      label: '反馈管理',
      onClick: () => navigate('/feedbacks'),
    },
    {
      key: '/llm-config',
      icon: <ApiOutlined />,
      label: 'LLM 配置',
      onClick: () => navigate('/llm-config'),
    },
    {
      key: '/system-settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/system-settings'),
    },
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
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

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    if (location.pathname.startsWith('/users')) return '/users';
    if (location.pathname.startsWith('/membership')) return '/membership';
    if (location.pathname.startsWith('/feedbacks')) return '/feedbacks';
    if (location.pathname.startsWith('/llm-config')) return '/llm-config';
    if (location.pathname.startsWith('/system-settings')) return '/system-settings';
    return '/users';
  };

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        className="admin-sider"
      >
        <div className="admin-logo">
          {collapsed ? '小佩' : '小佩 Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-btn"
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <UserOutlined />
              <span>{adminUser?.username}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

