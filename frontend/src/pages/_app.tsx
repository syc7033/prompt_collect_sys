import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AuthProvider } from '../utils/AuthContext';
import '../styles/globals.css';
// 引入中文文本显示修复样式
import '../styles/chinese-text-fix.css';
// 引入专门针对Ant Design的CSS修复
import '../styles/antd-chinese-fix.css';
// 引入分页导航样式修复
import '../styles/pagination-fix.css';
// Ant Design 4.x使用antd/dist/antd.css
import 'antd/dist/antd.css';

function MyApp({ Component, pageProps }: AppProps) {
  // 添加全局样式设置
  useEffect(() => {
    console.log('_app.tsx 加载 - 设置全局样式');
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
    
    // 添加全局内联样式以确保所有元素正确显示
    const style = document.createElement('style');
    style.textContent = `
      html, body, div, span, applet, object, iframe,
      h1, h2, h3, h4, h5, h6, p, blockquote, pre,
      a, abbr, acronym, address, big, cite, code,
      del, dfn, em, img, ins, kbd, q, s, samp,
      small, strike, strong, sub, sup, tt, var,
      b, u, i, center,
      dl, dt, dd, ol, ul, li,
      fieldset, form, label, legend,
      table, caption, tbody, tfoot, thead, tr, th, td,
      article, aside, canvas, details, embed, 
      figure, figcaption, footer, header, hgroup, 
      menu, nav, output, ruby, section, summary,
      time, mark, audio, video, input, textarea, button {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        text-align: initial;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
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
