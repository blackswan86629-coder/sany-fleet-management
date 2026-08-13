import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#E31937',
          colorBgContainer: '#12121a',
          colorBgElevated: '#141418',
          colorBgLayout: '#0a0a0c',
          colorText: '#f0f0f2',
          colorTextSecondary: '#8a8a96',
          colorBorder: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          colorBgTextHover: 'rgba(255,255,255,0.04)',
          colorBgTextActive: 'rgba(255,255,255,0.06)',
        },
        components: {
          Menu: { itemSelectedBg: 'rgba(227,25,55,0.10)', itemSelectedColor: '#E31937', itemHoverBg: 'rgba(255,255,255,0.04)', itemHoverColor: '#f0f0f2' },
          Card: { colorBgContainer: 'rgba(18,18,24,0.88)' },
          Table: { colorBgContainer: 'transparent', headerBg: 'rgba(255,255,255,0.03)', rowHoverBg: 'rgba(255,255,255,0.03)' },
          Input: { colorBgContainer: 'rgba(255,255,255,0.04)', activeBorderColor: '#E31937', activeShadow: '0 0 0 3px rgba(227,25,55,0.10)' },
          Select: { colorBgContainer: 'rgba(255,255,255,0.04)', optionSelectedBg: 'rgba(227,25,55,0.10)' },
          Button: { primaryShadow: '0 2px 8px rgba(227,25,55,0.25)' },
          Badge: { colorError: '#E31937' },
        },
      }}
    >
      <BrowserRouter basename="/sany-fleet-management">
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
