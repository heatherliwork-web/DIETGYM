# 🚀 Vercel 快速部署指南

## 📋 部署前准备

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

---

## 🎯 部署步骤（推荐方案）

### 步骤 1：创建 Vercel 项目

```bash
vercel
```

按提示操作，选择您的团队和项目名称。

### 步骤 2：创建 Vercel Postgres 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入您的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres**
6. 数据库会自动创建并连接

### 步骤 3：运行数据库迁移

在本地设置环境变量：

```bash
# 从 Vercel Dashboard 复制 POSTGRES_URL
export POSTGRES_URL="your_postgres_url_here"
```

运行迁移：

```bash
npm run db:migrate
```

### 步骤 4：配置环境变量

在 Vercel Dashboard 中设置：

1. 进入项目设置
2. 选择 **Environment Variables**
3. 添加以下变量：
   - `GEMINI_API_KEY` - 您的 Gemini API Key
   - `POSTGRES_URL` - 自动设置
   - `POSTGRES_PRISMA_URL` - 自动设置
   - `POSTGRES_URL_NON_POOLING` - 自动设置

### 步骤 5：部署到生产环境

```bash
vercel --prod
```

---

## ✅ 验证部署

### 1. 检查 API 健康状态

访问：`https://your-app.vercel.app/api/health`

应该看到：
```json
{
  "success": true,
  "message": "DIETGYM API is running",
  "timestamp": "2026-03-03T..."
}
```

### 2. 测试前端

访问：`https://your-app.vercel.app`

- 应该能看到应用界面
- 可以创建用户
- 可以记录食物和运动

---

## 🔧 本地开发 vs 生产环境

### 本地开发（SQLite）

```bash
# 启动后端（使用 SQLite）
npm run dev:server

# 启动前端
npm run dev
```

### 生产环境（Postgres）

- 自动使用 Vercel Postgres
- 数据持久化
- 高可用性

---

## 📁 关键文件说明

### 已创建的文件

1. **vercel.json** - Vercel 配置
2. **api/index.ts** - Vercel API 入口
3. **server/database/init.pg.ts** - Postgres 连接
4. **server/database/migrate.ts** - 数据库迁移
5. **server/routes/\*.pg.ts** - Postgres 版本路由
6. **VERCEL_DEPLOYMENT.md** - 详细部署文档

---

## 🎨 部署架构

```
Vercel
├── 前端 (React)
│   └── https://your-app.vercel.app
│
├── API (Serverless Functions)
│   └── https://your-app.vercel.app/api/*
│
└── 数据库 (Vercel Postgres)
    └── 自动连接和配置
```

---

## ⚡ 快速命令

```bash
# 开发
npm run dev:all          # 同时启动前后端

# 部署
vercel                   # 预览部署
vercel --prod           # 生产部署

# 数据库
npm run db:migrate      # 运行迁移

# 日志
vercel logs             # 查看日志
vercel logs --follow    # 实时日志
```

---

## 🔍 故障排查

### 问题 1：数据库连接失败

**解决方案：**
- 检查 `POSTGRES_URL` 环境变量
- 确认数据库已创建
- 查看 Vercel 函数日志

### 问题 2：API 返回 404

**解决方案：**
- 检查 `api/index.ts` 文件
- 确认路由配置正确
- 查看 Vercel 部署日志

### 问题 3：前端无法连接 API

**解决方案：**
- 检查 CORS 配置
- 确认 API URL 正确
- 清除浏览器缓存

---

## 📊 性能优化建议

1. **启用边缘函数**
   - 在 `vercel.json` 中配置
   - 降低延迟

2. **配置缓存**
   - 静态资源缓存
   - API 响应缓存

3. **监控和分析**
   - 使用 Vercel Analytics
   - 监控函数执行时间

---

## 🎉 部署成功！

部署完成后，您将获得：

- ✅ 生产环境 URL
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（Git 集成）
- ✅ 数据持久化

---

## 📚 下一步

1. **配置自定义域名**
   - 在 Vercel Dashboard 中添加域名

2. **设置 Git 集成**
   - 连接 GitHub/GitLab
   - 自动部署

3. **添加监控**
   - Vercel Analytics
   - 错误追踪

---

## 💡 提示

- **开发环境**：继续使用 SQLite
- **生产环境**：使用 Vercel Postgres
- **测试环境**：使用 Vercel Preview 部署

---

需要帮助？查看 [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) 获取详细文档。
