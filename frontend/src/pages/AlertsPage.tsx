import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Card, Select, message } from 'antd';
import { alertApi } from '../api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');

  const fetch = async (p = page) => {
    setLoading(true);
    try { const r = await alertApi.list({ page: p, page_size: 15, severity: severity || undefined }); setAlerts(r.data.items); setTotal(r.data.total); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(1); }, [severity]);

  const handleAck = async (id: number, s: string) => { await alertApi.acknowledge(id, s); message.success('已更新'); fetch(); };

  const sevMap: Record<string, { color: string; label: string }> = {
    critical: { color: 'red', label: '紧急' }, high: { color: 'orange', label: '高' },
    medium: { color: 'gold', label: '中' }, low: { color: 'blue', label: '低' }, info: { color: 'default', label: '信息' },
  };
  const typeMap: Record<string, string> = {
    speed: '超速', geofence: '围栏', idle: '怠速', emergency: '紧急', collision: '碰撞',
    comm_lost: '通信中断', dtc: 'DTC故障', low_fuel: '低油量', overheat: '过热', low_voltage: '低电压', tamper: '篡改', pto: 'PTO',
  };

  return (
    <Card>
      <div style={{ marginBottom: 20 }}>
        <Select placeholder="严重等级" style={{ width: 120 }} allowClear value={severity || undefined}
          onChange={v => setSeverity(v || '')}
          options={Object.entries(sevMap).map(([k, v]) => ({ value: k, label: v.label }))} />
      </div>
      <Table columns={[
        { title: '类型', dataIndex: 'alert_type', width: 100, render: (t: string) => typeMap[t] || t },
        { title: '等级', dataIndex: 'severity', width: 80, render: (s: string) => <Tag color={sevMap[s]?.color}>{sevMap[s]?.label || s}</Tag> },
        { title: '描述', dataIndex: 'description', ellipsis: true },
        { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === 'active' ? 'error' : s === 'acknowledged' ? 'warning' : 'success'}>{s === 'active' ? '活跃' : s === 'acknowledged' ? '已确认' : '已解决'}</Tag> },
        { title: '时间', dataIndex: 'timestamp', width: 160, render: (t: string) => new Date(t).toLocaleString('zh-CN') },
        { title: '操作', width: 130, render: (_: any, r: any) => (
          <Space>
            {r.status === 'active' && <Button size="small" type="link" onClick={() => handleAck(r.id, 'acknowledged')}>确认</Button>}
            {r.status !== 'resolved' && <Button size="small" type="link" onClick={() => handleAck(r.id, 'resolved')}>解决</Button>}
          </Space>
        )},
      ]} dataSource={alerts} rowKey="id" loading={loading}
        pagination={{ current: page, total, pageSize: 15, onChange: p => { setPage(p); fetch(p); }, showTotal: t => `共 ${t} 条` }} size="middle" />
    </Card>
  );
}
