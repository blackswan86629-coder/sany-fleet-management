import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, message, Modal, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { vehicleApi } from '../api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();

  const fetch = async (p = page) => {
    setLoading(true);
    try {
      const res = await vehicleApi.list({ page: p, page_size: 15, keyword, status: statusFilter || undefined });
      setVehicles(res.data.items); setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(1); }, [statusFilter]);

  const handleAdd = async () => {
    try {
      const v = await form.validateFields();
      await vehicleApi.create(v);
      message.success('添加成功'); setAddModal(false); form.resetFields(); fetch();
    } catch (e: any) { if (e.response?.data?.detail) message.error(e.response.data.detail); }
  };

  const typeMap: Record<string, string> = {
    water_foam: '水/泡沫', municipal_pump: '泵车', ladder: '云梯',
    drone: '无人机', robot: '机器人', small: '小型', motorcycle: '摩托',
  };
  const statusMap: Record<string, { color: string; text: string }> = {
    moving: { color: 'processing', text: '行驶' }, idle: { color: 'warning', text: '静止' },
    offline: { color: 'default', text: '离线' }, maintenance: { color: 'error', text: '维修' },
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space size={12}>
          <Input.Search placeholder="搜索车牌/名称" style={{ width: 240 }} onSearch={v => { setKeyword(v); fetch(1); }} allowClear />
          <Select placeholder="状态" style={{ width: 110 }} allowClear value={statusFilter || undefined}
            onChange={v => setStatusFilter(v || '')}
            options={[{ value: 'moving', label: '行驶' }, { value: 'idle', label: '静止' }, { value: 'offline', label: '离线' }]} />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>添加车辆</Button>
      </div>
      <Table columns={[
        { title: '车牌号', dataIndex: 'plate_number', width: 110, render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
        { title: '名称', dataIndex: 'name', ellipsis: true },
        { title: '类型', dataIndex: 'vehicle_type', width: 100, render: (t: string) => typeMap[t] || t },
        { title: '品牌', dataIndex: 'brand', width: 80 },
        { title: '车队', dataIndex: 'fleet_id', width: 80 },
        { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => { const m = statusMap[s]; return <Tag color={m?.color}>{m?.text || s}</Tag>; } },
        { title: '速度', dataIndex: 'current_speed', width: 90, render: (v: number) => `${(v || 0).toFixed(0)} km/h` },
        { title: '操作', width: 120, render: (_: any, r: any) => (
          <Space>
            <Button size="small" type="link">编辑</Button>
            <Button size="small" type="link" danger onClick={() => Modal.confirm({ title: '确认删除?', onOk: async () => { await vehicleApi.delete(r.id); message.success('已删除'); fetch(); } })}>删除</Button>
          </Space>
        )},
      ]} dataSource={vehicles} rowKey="id" loading={loading}
        pagination={{ current: page, total, pageSize: 15, onChange: p => { setPage(p); fetch(p); }, showTotal: t => `共 ${t} 辆` }} size="middle" />
      <Modal title="添加车辆" open={addModal} onOk={handleAdd} onCancel={() => setAddModal(false)}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="plate_number" label="车牌号" rules={[{ required: true }]}><Input placeholder="FW-011" /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="水罐消防车 FW-011" /></Form.Item>
          <Form.Item name="vehicle_type" label="类型" rules={[{ required: true }]}><Select options={Object.entries(typeMap).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item>
          <Form.Item name="brand" label="品牌"><Input /></Form.Item>
          <Form.Item name="fleet_id" label="车队"><Select options={['Alpha', 'Bravo', 'Charlie'].map(v => ({ value: v, label: v }))} allowClear /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
