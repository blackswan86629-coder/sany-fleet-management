import { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, List, Badge, Tag, Space, Button } from 'antd';
import {
  CarOutlined, AlertOutlined, ThunderboltOutlined, DashboardOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { dashboardApi, alertApi, vehicleApi } from '../api';

function StatCard({ title, value, icon, color, bg, change }: {
  title: string; value: number | string; icon: React.ReactNode;
  color: string; bg: string; change?: string;
}) {
  return (
    <Card styles={{ body: { padding: '28px 24px' } }} style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-primary)' }}>{value}</div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 22,
        }}>{icon}</div>
      </div>
      {change && (
        <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowUpOutlined style={{ fontSize: 10 }} /> {change}
        </div>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.stats().then(r => setStats(r.data)).catch(() => {});
    alertApi.active().then(r => setAlerts(r.data.items || [])).catch(() => {});
    vehicleApi.realtime().then(r => setVehicles(r.data || [])).catch(() => {});
  }, []);

  const severityColor: Record<string, string> = {
    critical: '#E31937', high: '#ff6b35', medium: '#f59e0b', low: '#3b82f6', info: '#55555f',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <Row gutter={[20, 20]}>
        <Col span={6}>
          <StatCard title="在线车辆" value={stats?.online_vehicles ?? '—'} icon={<CarOutlined />}
            color="#E31937" bg="rgba(227,25,55,0.10)" change="较昨日 +3" />
        </Col>
        <Col span={6}>
          <StatCard title="行驶中" value={stats?.moving_vehicles ?? '—'} icon={<DashboardOutlined />}
            color="#3b82f6" bg="rgba(59,130,246,0.10)" change="较上周 +12%" />
        </Col>
        <Col span={6}>
          <StatCard title="今日报警" value={stats?.alert_count_today ?? '—'} icon={<AlertOutlined />}
            color="#f59e0b" bg="rgba(245,158,11,0.10)" />
        </Col>
        <Col span={6}>
          <StatCard title="今日里程(km)" value={stats?.total_distance_today ?? '—'} icon={<ThunderboltOutlined />}
            color="#E31937" bg="rgba(227,25,55,0.10)" change="较上周 +8%" />
        </Col>
      </Row>

      {/* Main */}
      <Row gutter={20} style={{ flex: 1 }}>
        {/* Fleet Status */}
        <Col span={16}>
          <Card title="车队状态" style={{ height: '100%' }}>
            <Row gutter={24} style={{ padding: '12px 0' }}>
              {[
                { label: '行驶中', count: stats?.moving_vehicles ?? 0, total: stats?.total_vehicles ?? 1, color: '#3b82f6' },
                { label: '静止', count: stats?.idle_vehicles ?? 0, total: stats?.total_vehicles ?? 1, color: '#f59e0b' },
                { label: '离线', count: stats?.offline_vehicles ?? 0, total: stats?.total_vehicles ?? 1, color: '#55555f' },
              ].map((s, i) => (
                <Col span={8} key={i}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Progress type="circle" percent={Math.round((s.count / s.total) * 100)}
                      strokeColor={s.color} trailColor="rgba(255,255,255,0.04)" size={110} strokeWidth={8}
                      format={() => <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</span>} />
                    <div style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.count}/{s.total} 辆</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Alerts */}
        <Col span={8}>
          <Card
            title={<Space>实时报警 <Badge count={alerts.length} style={{ background: '#E31937', fontSize: 11 }} /></Space>}
            extra={<Button type="link" size="small" style={{ fontSize: 12 }}>查看全部</Button>}
            style={{ height: '100%' }}
            styles={{ body: { padding: 0, maxHeight: 380, overflow: 'auto' } }}
          >
            <List dataSource={alerts.slice(0, 6)} renderItem={(item: any) => (
              <List.Item style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <List.Item.Meta
                  avatar={<div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6,
                    background: severityColor[item.severity] || '#55555f',
                    boxShadow: item.severity === 'critical' ? `0 0 10px ${severityColor.critical}60` : 'none',
                  }} />}
                  title={<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</span>}
                  description={
                    <Space size={8}>
                      <Tag color={item.severity === 'critical' ? 'red' : item.severity === 'high' ? 'orange' : 'gold'} style={{ fontSize: 10, margin: 0 }}>
                        {item.severity?.toUpperCase()}
                      </Tag>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>

      {/* Vehicle List */}
      <Card title="车辆快速一览" styles={{ body: { padding: 0, maxHeight: 260, overflow: 'auto' } }}>
        <List dataSource={vehicles.slice(0, 8)} renderItem={(v: any) => (
          <List.Item style={{ padding: '10px 20px' }}>
            <Space size={12}>
              <Badge status={v.status === 'moving' ? 'processing' : v.status === 'idle' ? 'warning' : 'default'} />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{v.plate_number}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v.name}</span>
            </Space>
            <Space style={{ marginLeft: 'auto' }} size={12}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{v.speed?.toFixed(0) ?? 0} km/h</span>
              <Tag style={{ borderRadius: 6 }}>{v.fleet_id}</Tag>
            </Space>
          </List.Item>
        )} />
      </Card>
    </div>
  );
}
