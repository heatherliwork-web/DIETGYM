<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DIETGYM - 智能饮食健身追踪应用

一款基于 AI 的饮食健身追踪应用，支持食物识别、运动分析和营养目标管理。

## 功能特性

- 🍎 **智能食物识别** - 拍照识别食物，自动分析营养成分
- 🏃 **运动追踪** - 记录运动数据，计算卡路里消耗
- 📊 **营养目标管理** - 个性化每日营养目标设定
- 📈 **数据可视化** - 直观的进度展示和统计分析
- 🤖 **AI 驱动** - 使用 Gemini AI 进行智能分析

## 技术栈

### 前端
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Framer Motion
- Google Gemini AI

### 后端
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- RESTful API

## 项目结构

```
DIETGYM/
├── src/                    # 前端源代码
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 样式文件
├── server/                 # 后端源代码
│   ├── database/          # 数据库相关
│   │   ├── schema.sql     # 数据库架构
│   │   └── init.ts        # 数据库初始化
│   ├── middleware/        # Express 中间件
│   ├── routes/            # API 路由
│   ├── types/             # TypeScript 类型定义
│   ├── index.ts           # 服务器入口
│   └── API_DOCUMENTATION.md # API 文档
├── data/                   # SQLite 数据库文件（自动创建）
├── package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 运行应用

**方式 1: 分别运行前后端（推荐用于开发）**

```bash
# 终端 1 - 运行前端
npm run dev

# 终端 2 - 运行后端
npm run dev:server
```

**方式 2: 同时运行前后端**

```bash
npm run dev:all
```

### 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api
- API 文档: [server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)

## API 端点

### 用户管理
- `POST /api/users` - 创建用户
- `GET /api/users/:userId` - 获取用户信息
- `PUT /api/users/:userId` - 更新用户信息
- `GET /api/users/:userId/goals` - 获取营养目标
- `PUT /api/users/:userId/goals` - 更新营养目标

### 食物记录
- `POST /api/food` - 添加食物记录
- `GET /api/food/:userId` - 获取食物记录
- `DELETE /api/food/:logId` - 删除食物记录
- `GET /api/food/:userId/stats` - 获取每日统计

### 运动记录
- `POST /api/workouts` - 添加运动记录
- `GET /api/workouts/:userId` - 获取运动记录
- `DELETE /api/workouts/:logId` - 删除运动记录

详细 API 文档请查看 [server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)

## 测试 API

运行 API 测试脚本：

```bash
node server/test-api.js
```

## 数据库架构

应用使用 SQLite 数据库，包含以下表：

- **users** - 用户信息
- **daily_goals** - 每日营养目标
- **food_logs** - 食物记录
- **workout_logs** - 运动记录

详细的数据库架构请查看 [server/database/schema.sql](server/database/schema.sql)

## 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端
npm run build:server

# 运行生产版本
npm start
```

## 开发指南

### 前端开发

前端使用 React + TypeScript + Tailwind CSS，主要文件：

- `src/App.tsx` - 主应用组件，包含所有页面逻辑
- `src/index.css` - Tailwind CSS 配置

### 后端开发

后端使用 Express + TypeScript + SQLite：

- `server/routes/` - API 路由定义
- `server/middleware/` - 中间件（验证、错误处理）
- `server/database/` - 数据库初始化和模型

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| GEMINI_API_KEY | Google Gemini API 密钥 | - |
| PORT | 后端服务器端口 | 3001 |
| NODE_ENV | 运行环境 | development |
| FRONTEND_URL | 前端 URL（用于 CORS） | http://localhost:3000 |

## 🚀 Vercel 部署

### 快速部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

3. **创建 Vercel Postgres 数据库**
   - 在 Vercel Dashboard 中创建 Postgres 数据库
   - 数据库会自动连接到您的项目

4. **运行数据库迁移**
   ```bash
   npm run db:migrate
   ```

5. **配置环境变量**
   - `GEMINI_API_KEY` - 您的 Gemini API Key
   - Postgres 相关变量会自动设置

### 详细部署指南

- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 快速部署指南
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - 完整部署文档

### 部署架构

```
Vercel
├── 前端 (React) → https://your-app.vercel.app
├── API (Serverless) → https://your-app.vercel.app/api
└── 数据库 (Postgres) → 自动连接
```

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
