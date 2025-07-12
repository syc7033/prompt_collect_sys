@echo off
echo 正在修复前端应用...

echo 1. 删除node_modules和缓存
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q .next

echo 2. 更新package.json
echo {> package.json
echo   "name": "prompt-system-frontend",>> package.json
echo   "version": "0.1.0",>> package.json
echo   "private": true,>> package.json
echo   "scripts": {>> package.json
echo     "dev": "next dev",>> package.json
echo     "build": "next build",>> package.json
echo     "start": "next start",>> package.json
echo     "lint": "next lint">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "next": "12.3.4",>> package.json
echo     "react": "17.0.2",>> package.json
echo     "react-dom": "17.0.2",>> package.json
echo     "axios": "0.27.2",>> package.json
echo     "react-hook-form": "7.33.1",>> package.json
echo     "antd": "4.24.14",>> package.json
echo     "@ant-design/icons": "4.8.1",>> package.json
echo     "js-cookie": "3.0.5",>> package.json
echo     "swr": "1.3.0">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "@types/node": "18.0.0",>> package.json
echo     "@types/react": "17.0.2",>> package.json
echo     "@types/react-dom": "17.0.2",>> package.json
echo     "@types/js-cookie": "3.0.3",>> package.json
echo     "typescript": "4.7.4",>> package.json
echo     "eslint": "8.19.0",>> package.json
echo     "eslint-config-next": "12.3.4">> package.json
echo   }>> package.json
echo }>> package.json

echo 3. 更新_app.tsx文件
echo import React from 'react';> src\pages\_app.tsx
echo import { AppProps } from 'next/app';>> src\pages\_app.tsx
echo import { ConfigProvider } from 'antd';>> src\pages\_app.tsx
echo import zhCN from 'antd/lib/locale/zh_CN';>> src\pages\_app.tsx
echo import { AuthProvider } from '../utils/AuthContext';>> src\pages\_app.tsx
echo import '../styles/globals.css';>> src\pages\_app.tsx
echo import 'antd/dist/antd.css';>> src\pages\_app.tsx
echo.>> src\pages\_app.tsx
echo function MyApp({ Component, pageProps }: AppProps) {>> src\pages\_app.tsx
echo   return (>> src\pages\_app.tsx
echo     ^<ConfigProvider locale={zhCN}^>>> src\pages\_app.tsx
echo       ^<AuthProvider^>>> src\pages\_app.tsx
echo         ^<Component {...pageProps} /^>>> src\pages\_app.tsx
echo       ^</AuthProvider^>>> src\pages\_app.tsx
echo     ^</ConfigProvider^>>> src\pages\_app.tsx
echo   );>> src\pages\_app.tsx
echo }>> src\pages\_app.tsx
echo.>> src\pages\_app.tsx
echo export default MyApp;>> src\pages\_app.tsx

echo 4. 安装依赖
call npm install

echo 修复完成！
echo 现在可以运行 npm run dev 启动应用
pause
