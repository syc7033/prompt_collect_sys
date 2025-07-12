# AI提示词知识库前端

这是AI提示词知识库的前端应用，使用Next.js和Ant Design构建。

## 功能特性

- 用户认证（注册、登录）
- 提示词管理（创建、查看、编辑、删除）
- 提示词版本控制和历史记录
- 提示词搜索和标签过滤
- 相似提示词推荐
- 响应式设计，适配各种设备

## 技术栈

- Next.js - React框架
- TypeScript - 类型安全的JavaScript
- Ant Design - UI组件库
- Axios - HTTP客户端
- SWR - 数据获取和缓存
- React Hook Form - 表单处理

## 开始使用

### 前提条件

- Node.js 14.x 或更高版本
- 后端API服务已启动（默认地址：http://localhost:8000/api）

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式运行

```bash
npm run dev
# 或
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
```

## 环境变量

在`.env.local`文件中配置以下环境变量：

- `NEXT_PUBLIC_API_URL` - 后端API的基础URL（默认：http://localhost:8000/api）

## 项目结构

```
frontend/
├── public/                # 静态资源
├── src/
│   ├── components/        # 可复用组件
│   │   ├── auth/          # 认证相关组件
│   │   ├── prompts/       # 提示词相关组件
│   │   └── ui/            # UI组件
│   ├── pages/             # 页面组件
│   │   ├── api/           # API路由
│   │   ├── auth/          # 认证页面
│   │   ├── prompts/       # 提示词页面
│   │   └── index.js       # 首页
│   ├── services/          # API服务
│   ├── styles/            # 样式文件
│   └── utils/             # 工具函数
├── .env.local             # 环境变量
├── next.config.js         # Next.js配置
└── package.json           # 项目依赖
```

## 连接到后端

前端应用默认通过Next.js的API路由代理将请求转发到后端API。确保后端服务在http://localhost:8000运行，或者在`.env.local`和`next.config.js`中更新API地址。
