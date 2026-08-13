import { Card, Row, Col, Progress, List, Tag, Space } from 'antd';
import { DropboxOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { vehicleApi } from '../api';

export default function FuelPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  useEffect(() => { vehicleApi.realtime().then(r => setVehicles(r.data || [])).catch(() => {}); }, []);

  const fuelData = vehicles.map((v: any, i: number) => ({
    ...v, fuel: Math.max(5, 90 - i * 6 + Math.floor(Math.random() * 10)),
  })).sort((a: any, b: any) => a.fuel - b.fuel);

  const avgFuel = fuelData.length ? Math.round(fuelData.reduce((s: number, v: any) => s + v.fuel, 0) / fuelData.length) : 0;
  const lowFuel = fuelData.filter((v: any) => v.fuel < 20).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={20}>
        <Col span={8}>
          <Card styles={{ body: { padding: '28px 24px' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>车队平均油量</span>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,122,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007AFF' }}><DropboxOutlined /></div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>{avgFuel}%</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card styles={{ body: { padding: '28px 24px' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>低油量车辆</span>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,59,48,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3B30' }}><WarningOutlined /></div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: lowFuel > 0 ? '#FF3B30' : 'var(--text-primary)' }}>{lowFuel}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card styles={{ body: { padding: '28px 24px' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>今日总油耗(L)</span>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,199,89,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34C759' }}><ArrowDownOutlined /></div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>{Math.floor(Math.random() * 200 + 300)}</div>
          </Card>
        </Col>
      </Row>

      <Card title="车辆油量一览" styles={{ body: { padding: 0 } }}>
        <List dataSource={fuelData} renderItem={(v: any) => (
          <List.Item style={{ padding: '14px 24px' }}>
            <Space size={16} style={{ width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 14, width: 90 }}>{v.plate_number}</span>
              <Progress percent={v.fuel} size="small" style={{ flex: 1, minWidth: 200 }}
                strokeColor={v.fuel < 20 ? '#FF3B30' : v.fuel < 40 ? '#FF9500' : '#34C759'}
                trailColor="rgba(0,0,0,0.04)" format={p => `${p}%`} />
              {v.fuel < 20 && <Tag color="red">低油量</Tag>}
            </Space>
          </List.Item>
        )} />
      </Card>
    </div>
  );
}
