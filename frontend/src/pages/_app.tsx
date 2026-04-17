import React from 'react';
import { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AuthProvider } from '../utils/AuthContext';
import '../styles/globals.css';
// Ant Design 4.x使用antd/dist/antd.css
import 'antd/dist/antd.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider locale={zhCN} direction="ltr">
      <div style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </div>
    </ConfigProvider>
  );
}

export default MyApp;
