import { Card, Table, Tag, Space, Button, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const DEMO_DEVICES = [
  { id: 1, imei: '869012345678901', sim: '923012345678', firmware: '1.2.0', hw: 'TBOX-v2', status: 'online', vehicle: 'FW-001', heartbeat: '2026-08-13 17:55:00' },
  { id: 2, imei: '869012345678902', sim: '923012345679', firmware: '1.2.0', hw: 'TBOX-v2', status: 'online', vehicle: 'FW-003', heartbeat: '2026-08-13 17:54:30' },
  { id: 3, imei: '869012345678903', sim: '923012345680', firmware: '1.1.8', hw: 'TBOX-v1', status: 'online', vehicle: 'LP-002', heartbeat: '2026-08-13 17:50:12' },
  { id: 4, imei: '869012345678904', sim: '923012345681', firmware: '1.2.0', hw: 'TBOX-v2', status: 'online', vehicle: 'PM-005', heartbeat: '2026-08-13 17:55:10' },
  { id: 5, imei: '869012345678905', sim: '923012345682', firmware: '1.2.0', hw: 'TBOX-v2', status: 'offline', vehicle: 'FW-007', heartbeat: '2026-08-13 15:20:00' },
  { id: 6, imei: '869012345678906', sim: '923012345683', firmware: '1.1.8', hw: 'TBOX-v1', status: 'online', vehicle: 'DR-001', heartbeat: '2026-08-13 17:55:22' },
  { id: 7, imei: '869012345678907', sim: '923012345684', firmware: '1.2.0', hw: 'TBOX-v2', status: 'online', vehicle: 'RB-001', heartbeat: '2026-08-13 17:53:45' },
  { id: 8, imei: '869012345678908', sim: '923012345685', firmware: '1.1.5', hw: 'TBOX-v1', status: 'offline', vehicle: 'MC-003', heartbeat: '2026-08-12 09:10:00' },
];

export default function DevicesPage() {
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Input.Search placeholder="搜索IMEI/车辆" style={{ width: 260 }} allowClear />
        <Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>注册终端</Button>
        </Space>
      </div>
      <Table columns={[
        { title: 'IMEI', dataIndex: 'imei', width: 160, render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span> },
        { title: 'SIM卡', dataIndex: 'sim', width: 130 },
        { title: '固件', dataIndex: 'firmware', width: 80 },
        { title: '硬件', dataIndex: 'hw', width: 90 },
        { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === 'online' ? 'success' : 'default'}>{s === 'online' ? '在线' : '离线'}</Tag> },
        { title: '绑定车辆', dataIndex: 'vehicle', width: 100, render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
        { title: '最后心跳', dataIndex: 'heartbeat', width: 170 },
        { title: '操作', width: 120, render: () => (
          <Space><Button size="small" type="link">OTA升级</Button><Button size="small" type="link">详情</Button></Space>
        )},
      ]} dataSource={DEMO_DEVICES} rowKey="id" pagination={false} size="middle" />

      <Modal title="注册终端" open={addModal} onCancel={() => setAddModal(false)}
        onOk={() => { message.success('终端已注册'); setAddModal(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="imei" label="IMEI" rules={[{ required: true }]}><Input placeholder="869012345678901" /></Form.Item>
          <Form.Item name="sim" label="SIM卡号"><Input /></Form.Item>
          <Form.Item name="firmware" label="固件版本"><Input /></Form.Item>
          <Form.Item name="vehicle_id" label="绑定车辆"><Select allowClear placeholder="选择车辆" options={['FW-001', 'FW-003', 'LP-002'].map(v => ({ value: v, label: v }))} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
