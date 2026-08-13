import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined, EnvironmentOutlined, CarOutlined,
  AlertOutlined, SettingOutlined, UserOutlined, LogoutOutlined,
  BellOutlined, VideoCameraOutlined, BarChartOutlined, ToolOutlined,
  DropboxOutlined,
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/map', icon: <EnvironmentOutlined />, label: '实时地图' },
  { key: '/vehicles', icon: <CarOutlined />, label: '车辆管理' },
  { key: 'divider1', type: 'divider' as const },
  { key: '/alerts', icon: <AlertOutlined />, label: '报警中心' },
  { key: '/fuel', icon: <DropboxOutlined />, label: '燃油监控' },
  { key: '/video', icon: <VideoCameraOutlined />, label: '视频监控' },
  { key: '/reports', icon: <BarChartOutlined />, label: '报表中心' },
  { key: 'divider2', type: 'divider' as const },
  { key: '/devices', icon: <ToolOutlined />, label: '终端管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const pageTitles: Record<string, string> = {
  '/': '仪表盘', '/map': '实时地图', '/vehicles': '车辆管理', '/alerts': '报警中心',
  '/fuel': '燃油监控', '/video': '视频监控', '/reports': '报表中心', '/devices': '终端管理', '/settings': '系统设置',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人设置' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录',
        onClick: () => { localStorage.removeItem('token'); navigate('/login'); } },
    ],
  };

  return (
    <Layout style={{ height: '100vh', background: 'var(--bg-base)' }}>
      {/* ─── Sidebar ─── */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260}
        style={{
          background: 'rgba(14,14,18,0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
        }}
        trigger={null}
      >
        {/* Logo — SANY red accent line on top */}
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}>
          {/* Red accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #E31937, #ff4d6a)', opacity: 0.9 }} />

          <div style={{
            width: 40, height: 40, borderRadius: 10,
            overflow: 'hidden', flexShrink: 0,
            background: '#fff',
            boxShadow: '0 2px 12px rgba(227,25,55,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={import.meta.env.BASE_URL + "sany-logo.webp"} alt="SANY" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>SANY Auto-SaaS</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: 1, textTransform: 'uppercase' }}>Fleet Command</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 10px', flex: 1 }}>
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems}
            onClick={({ key }) => navigate(key)} />
        </div>

        {/* User */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Avatar size={34} style={{ background: 'linear-gradient(135deg, #E31937, #ff4d6a)', fontSize: 13, fontWeight: 600 }}>A</Avatar>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>超级管理员</div>
            </div>
          )}
        </div>
      </Sider>

      {/* ─── Main ─── */}
      <Layout style={{ background: 'var(--bg-base)' }}>
        {/* Header — frosted glass with red accent */}
        <Header style={{
          background: 'rgba(14,14,18,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 52, lineHeight: '52px', padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            {pageTitles[location.pathname] || 'SANY Fleet'}
          </h2>
          <Space size={16} align="center">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-blue 2s ease-in-out infinite' }} />
              实时在线
            </div>
            <Badge count={3} size="small" offset={[-2, 2]}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 160ms ease',
              }}>
                <BellOutlined style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
              </div>
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar size={32} style={{ background: 'linear-gradient(135deg, #E31937, #ff4d6a)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>A</Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 24, overflow: 'auto', flex: 1 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
