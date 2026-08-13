import { Card, Row, Col, Table, Select, Space, Button, DatePicker, Statistic } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';

const REPORT_TYPES = [
  { value: 'daily', label: '车队日报' },
  { value: 'utilization', label: '车辆利用率' },
  { value: 'fuel', label: '燃油效率' },
  { value: 'diagnostic', label: 'OBD诊断摘要' },
  { value: 'speeding', label: '超速事件' },
  { value: 'geofence', label: '围栏合规' },
  { value: 'idle', label: '怠速报告' },
  { value: 'pto', label: 'PTO操作日志' },
  { value: 'executive', label: '高管摘要' },
];

const DEMO_DATA = [
  { key: 1, vehicle: 'FW-001', date: '2026-08-13', distance: 85.3, fuel: 42.1, alerts: 2, idle_min: 35, speed_avg: 38 },
  { key: 2, vehicle: 'FW-003', date: '2026-08-13', distance: 120.5, fuel: 58.7, alerts: 1, idle_min: 12, speed_avg: 52 },
  { key: 3, vehicle: 'PM-005', date: '2026-08-13', distance: 67.2, fuel: 35.4, alerts: 3, idle_min: 48, speed_avg: 41 },
  { key: 4, vehicle: 'LP-002', date: '2026-08-13', distance: 23.8, fuel: 18.2, alerts: 0, idle_min: 95, speed_avg: 22 },
  { key: 5, vehicle: 'FW-007', date: '2026-08-13', distance: 0, fuel: 0, alerts: 1, idle_min: 0, speed_avg: 0 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row gutter={20}>
        <Col span={6}><Card styles={{ body: { padding: '24px' } }}><Statistic title="今日总里程(km)" value={296.8} precision={1} /></Card></Col>
        <Col span={6}><Card styles={{ body: { padding: '24px' } }}><Statistic title="今日总油耗(L)" value={154.4} precision={1} /></Card></Col>
        <Col span={6}><Card styles={{ body: { padding: '24px' } }}><Statistic title="报警总数" value={7} valueStyle={{ color: '#FF9500' }} /></Card></Col>
        <Col span={6}><Card styles={{ body: { padding: '24px' } }}><Statistic title="平均利用率" value={72.5} suffix="%" /></Card></Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Space>
            <Select value={reportType} onChange={setReportType} style={{ width: 160 }} options={REPORT_TYPES} />
            <DatePicker.RangePicker />
          </Space>
          <Space>
            <Button icon={<FileExcelOutlined />}>导出 Excel</Button>
            <Button icon={<FilePdfOutlined />}>导出 PDF</Button>
          </Space>
        </div>
        <Table columns={[
          { title: '车辆', dataIndex: 'vehicle', width: 100, render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
          { title: '日期', dataIndex: 'date', width: 120 },
          { title: '里程(km)', dataIndex: 'distance', width: 100, render: (v: number) => v.toFixed(1) },
          { title: '油耗(L)', dataIndex: 'fuel', width: 100, render: (v: number) => v.toFixed(1) },
          { title: '报警数', dataIndex: 'alerts', width: 80 },
          { title: '怠速(分)', dataIndex: 'idle_min', width: 90 },
          { title: '均速(km/h)', dataIndex: 'speed_avg', width: 100 },
        ]} dataSource={DEMO_DATA} pagination={false} size="middle" />
      </Card>
    </div>
  );
}
