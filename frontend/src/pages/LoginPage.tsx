import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.username, values.password);
      localStorage.setItem('token', res.data.access_token);
      message.success('登录成功');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0c',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(227,25,55,0.08) 0%, transparent 60%)',
    }}>
      <div style={{
        width: 420, background: 'rgba(18,18,24,0.9)',
        backdropFilter: 'blur(24px)',
        borderRadius: 20, padding: '52px 44px', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(227,25,55,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Red glow at top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #E31937, transparent)', opacity: 0.8 }} />

        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 18, margin: '0 auto 24px',
          overflow: 'hidden', background: '#fff',
          boxShadow: '0 4px 24px rgba(227,25,55,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/sany-logo.webp" alt="SANY" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: '#f0f0f2' }}>SANY Auto-SaaS</h1>
        <p style={{ color: '#55555f', fontSize: 14, marginBottom: 40, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Fleet Command Center</p>

        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: '#55555f' }} />} placeholder="用户名"
              style={{ height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#f0f0f2' }} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#55555f' }} />} placeholder="密码"
              style={{ height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#f0f0f2' }} />
          </Form.Item>
          <Form.Item style={{ marginTop: 36 }}>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{
                height: 50, borderRadius: 12, fontWeight: 600, fontSize: 16,
                background: '#E31937', borderColor: '#E31937',
                boxShadow: '0 4px 20px rgba(227,25,55,0.3)',
              }}>
              登 录
            </Button>
          </Form.Item>
        </Form>
        <p style={{ fontSize: 12, color: '#55555f' }}>Demo: admin / admin123</p>
      </div>
    </div>
  );
}
