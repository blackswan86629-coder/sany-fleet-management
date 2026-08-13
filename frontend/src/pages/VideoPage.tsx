import { Card, Row, Col, Select, Space, Empty, Tag } from 'antd';
import { VideoCameraOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

const DEMO_CAMERAS = [
  { id: 1, name: 'FW-001 前视', vehicle: 'FW-001', status: 'online' },
  { id: 2, name: 'FW-001 左视', vehicle: 'FW-001', status: 'online' },
  { id: 3, name: 'FW-001 右视', vehicle: 'FW-001', status: 'online' },
  { id: 4, name: 'FW-001 后视', vehicle: 'FW-001', status: 'offline' },
  { id: 5, name: 'PM-005 前视', vehicle: 'PM-005', status: 'online' },
  { id: 6, name: 'PM-005 后视', vehicle: 'PM-005', status: 'online' },
  { id: 7, name: 'LP-002 前视', vehicle: 'LP-002', status: 'online' },
  { id: 8, name: 'LP-002 云梯', vehicle: 'LP-002', status: 'online' },
];

export default function VideoPage() {
  const [layout, setLayout] = useState('4');
  const [selectedCam, setSelectedCam] = useState<any>(null);

  const cols = layout === '1' ? 1 : layout === '4' ? 2 : layout === '9' ? 3 : 4;
  const displayCams = DEMO_CAMERAS.slice(0, parseInt(layout));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select value={layout} onChange={setLayout} style={{ width: 120 }}
            options={[{ value: '1', label: '单画面' }, { value: '4', label: '四分屏' }, { value: '9', label: '九分屏' }, { value: '16', label: '十六分屏' }]} />
          <Select placeholder="选择车辆" style={{ width: 160 }} allowClear
            options={[...new Set(DEMO_CAMERAS.map(c => c.vehicle))].map(v => ({ value: v, label: v }))} />
        </Space>
        <Tag color="processing">8路在线 / 2路离线</Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, flex: 1 }}>
        {displayCams.map(cam => (
          <Card key={cam.id} hoverable onClick={() => setSelectedCam(cam)}
            styles={{ body: { padding: 0, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } }}
            style={{ cursor: 'pointer', border: selectedCam?.id === cam.id ? '2px solid var(--accent)' : undefined }}>
            {cam.status === 'online' ? (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <VideoCameraOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>LIVE</span>
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{cam.name}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <PauseCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <div style={{ fontSize: 12 }}>{cam.name} — 离线</div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
