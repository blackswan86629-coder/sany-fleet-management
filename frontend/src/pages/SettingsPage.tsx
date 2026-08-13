import { Card, Form, Input, Switch, Select, Button, Row, Col, message, Tabs } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export default function SettingsPage() {
  return (
    <Card>
      <Tabs items={[
        {
          key: 'general', label: '基本设置',
          children: (
            <Form layout="vertical" style={{ maxWidth: 600, marginTop: 16 }}>
              <Form.Item label="平台名称"><Input defaultValue="SANY Auto-SaaS Fleet Management" /></Form.Item>
              <Form.Item label="默认语言"><Select defaultValue="en" options={[{ value: 'en', label: 'English' }, { value: 'zh', label: '中文' }, { value: 'ur', label: 'اردو' }]} /></Form.Item>
              <Form.Item label="时区"><Select defaultValue="Asia/Karachi" options={[{ value: 'Asia/Karachi', label: 'Karachi (UTC+5)' }, { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' }]} /></Form.Item>
              <Form.Item label="数据保留天数"><Input type="number" defaultValue={730} suffix="天" /></Form.Item>
              <Form.Item><Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存')}>保存</Button></Form.Item>
            </Form>
          ),
        },
        {
          key: 'alerts', label: '报警阈值',
          children: (
            <Form layout="vertical" style={{ maxWidth: 600, marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="超速警告(km/h)"><Input type="number" defaultValue={80} /></Form.Item></Col>
                <Col span={12}><Form.Item label="超速严重(km/h)"><Input type="number" defaultValue={120} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="低油量阈值(%)"><Input type="number" defaultValue={15} /></Form.Item></Col>
                <Col span={12}><Form.Item label="过热阈值(°C)"><Input type="number" defaultValue={105} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="低电压阈值(V)"><Input type="number" defaultValue={11.5} /></Form.Item></Col>
                <Col span={12}><Form.Item label="怠速超时(分钟)"><Input type="number" defaultValue={20} /></Form.Item></Col>
              </Row>
              <Form.Item><Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存')}>保存</Button></Form.Item>
            </Form>
          ),
        },
        {
          key: 'report', label: '报告设置',
          children: (
            <Form layout="vertical" style={{ maxWidth: 600, marginTop: 16 }}>
              <Form.Item label="自动日报"><Switch defaultChecked /></Form.Item>
              <Form.Item label="日报发送时间"><Select defaultValue="08:00" options={['07:00', '08:00', '09:00'].map(v => ({ value: v, label: v }))} /></Form.Item>
              <Form.Item label="报告收件人"><Input.TextArea defaultValue="admin@kmc.gov.pk\nops@kmc.gov.pk" rows={3} /></Form.Item>
              <Form.Item label="导出格式"><Select mode="multiple" defaultValue={['pdf', 'xlsx']} options={[{ value: 'pdf', label: 'PDF' }, { value: 'xlsx', label: 'Excel' }, { value: 'csv', label: 'CSV' }]} /></Form.Item>
              <Form.Item><Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存')}>保存</Button></Form.Item>
            </Form>
          ),
        },
        {
          key: 'users', label: '用户管理',
          children: (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>管理平台用户和权限</p>
              <Button type="primary" style={{ marginBottom: 16 }}>添加用户</Button>
              <Card size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong>admin</strong> <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>System Admin — 超级管理员</span></div>
                  <Button size="small" type="link">编辑</Button>
                </div>
              </Card>
              <Card size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong>operator1</strong> <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Ahmad Khan — 操作员</span></div>
                  <Button size="small" type="link">编辑</Button>
                </div>
              </Card>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong>viewer1</strong> <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Inspector Ali — 只读</span></div>
                  <Button size="small" type="link">编辑</Button>
                </div>
              </Card>
            </div>
          ),
        },
        {
          key: 'map', label: '地图设置',
          children: (
            <Form layout="vertical" style={{ maxWidth: 600, marginTop: 16 }}>
              <Form.Item label="地图服务"><Select defaultValue="gaode" options={[{ value: 'gaode', label: '高德地图' }, { value: 'osm', label: 'OpenStreetMap' }, { value: 'google', label: 'Google Maps' }]} /></Form.Item>
              <Form.Item label="API Key"><Input.Password defaultValue="your-gaode-api-key" /></Form.Item>
              <Form.Item label="默认中心纬度"><Input type="number" defaultValue={24.8607} /></Form.Item>
              <Form.Item label="默认中心经度"><Input type="number" defaultValue={67.0011} /></Form.Item>
              <Form.Item><Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存')}>保存</Button></Form.Item>
            </Form>
          ),
        },
      ]} />
    </Card>
  );
}
