# Vercel 部署指南

## 🚀 部署方案选择

由于 Vercel 是 serverless 环境，SQLite 数据库无法使用。我们提供两种方案：

### 方案 A：使用 Vercel Postgres（推荐生产环境）
- ✅ 适合生产环境
- ✅ 数据持久化
- ✅ 自动备份
- ✅ 高可用性

### 方案 B：使用本地 SQLite（仅开发测试）
- ✅ 简单快速
- ✅ 免费部署
- ⚠️ 数据不持久（每次部署重置）
- ⚠️ 仅适合演示

---

## 方案 A：Vercel Postgres 部署（推荐）

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

### 步骤 3：创建 Vercel Postgres 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入您的项目
3. 点击 "Storage" 标签
4. 选择 "Create Database"
5. 选择 "Postgres"
6. 数据库会自动创建并连接到您的项目

### 步骤 4：创建数据库迁移文件

创建 `server/database/migrate.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        weight REAL DEFAULT 70,
        height REAL DEFAULT 175,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        calories INTEGER DEFAULT 2200,
        protein INTEGER DEFAULT 140,
        carbs INTEGER DEFAULT 250,
        fat INTEGER DEFAULT 70,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );

      CREATE TABLE IF NOT EXISTS food_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        food_name VARCHAR(255) NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        image_url TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workout_name VARCHAR(255) NOT NULL,
        calories_burned REAL NOT NULL,
        duration_minutes INTEGER,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date DATE NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
    `);
    
    console.log('✅ Database migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

### 步骤 5：修改数据库连接代码

创建 `server/database/init.pg.ts` (Postgres 版本):

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;

export interface User {
  id: number;
  username: string;
  display_name: string | null;
  weight: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface DailyGoal {
  id: number;
  user_id: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

export interface FoodLog {
  id: number;
  user_id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  logged_at: string;
  date: string;
}

export interface WorkoutLog {
  id: number;
  user_id: number;
  workout_name: string;
  calories_burned: number;
  duration_minutes: number | null;
  logged_at: string;
  date: string;
}

export interface DailyStats {
  date: string;
  calories_in: number;
  calories_out: number;
  protein_in: number;
  carbs_in: number;
  fat_in: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

### 步骤 6：创建 Vercel API 入口

创建 `api/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DIETGYM API is running',
    timestamp: new Date().toISOString()
  });
});

// 导入路由
import usersRouter from '../server/routes/users.pg.js';
import foodRouter from '../server/routes/food.pg.js';
import workoutsRouter from '../server/routes/workouts.pg.js';

app.use('/users', usersRouter);
app.use('/food', foodRouter);
app.use('/workouts', workoutsRouter);

export default app;
```

### 步骤 7：修改路由使用 Postgres

创建 Postgres 版本的路由文件（示例 `server/routes/users.pg.ts`）:

```typescript
import { Router, Response } from 'express';
import pool from '../database/init.pg.js';
import { AuthenticatedRequest } from '../types/express.js';
import { ApiResponse } from '../types/api.js';

const router = Router();

router.post('/', async (req, res) => {
  const { username, display_name, weight, height } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO users (username, display_name, weight, height)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, display_name || username, weight || 70, height || 175]
    );
    
    const user = result.rows[0];
    
    // 创建初始目标
    const today = new Date().toISOString().split('T')[0];
    const calories = Math.round((weight || 70) * 24 * 1.2);
    const protein = Math.round((weight || 70) * 2);
    const fat = Math.round((weight || 70) * 1);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    
    await pool.query(
      `INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, today, calories, protein, carbs, fat]
    );
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }
    throw error;
  }
});

export default router;
```

### 步骤 8：更新环境变量

在 `.env.local` 中添加：

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=https://your-app.vercel.app/api
```

### 步骤 9：部署

```bash
# 部署到 Vercel
vercel

# 部署到生产环境
vercel --prod
```

### 步骤 10：配置环境变量

在 Vercel Dashboard 中设置环境变量：

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加以下变量：
   - `GEMINI_API_KEY`
   - `POSTGRES_URL` (自动设置)
   - `POSTGRES_PRISMA_URL` (自动设置)
   - `POSTGRES_URL_NON_POOLING` (自动设置)

---

## 方案 B：简化部署（仅演示）

如果您只是想快速部署演示，可以使用以下简化方案：

### 步骤 1：修改 API 调用为前端直连

修改 `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### 步骤 2：部署前端到 Vercel

```bash
vercel
```

### 步骤 3：在 Vercel 设置环境变量

- `VITE_GEMINI_API_KEY`

### ⚠️ 注意事项

此方案仅适合演示，因为：
- 后端 API 不可用
- 数据仅保存在浏览器 localStorage
- 刷新页面可能丢失数据

---

## 🎯 推荐方案

**对于生产环境，强烈推荐使用方案 A（Vercel Postgres）**

优势：
- ✅ 数据持久化
- ✅ 高可用性
- ✅ 自动备份
- ✅ 可扩展性强

---

## 📝 部署检查清单

### 部署前
- [ ] 安装 Vercel CLI
- [ ] 登录 Vercel 账号
- [ ] 创建 Vercel Postgres 数据库
- [ ] 运行数据库迁移

### 部署时
- [ ] 配置环境变量
- [ ] 部署前端和后端
- [ ] 测试 API 端点

### 部署后
- [ ] 测试用户创建
- [ ] 测试食物记录
- [ ] 测试运动记录
- [ ] 测试数据持久化

---

## 🔧 故障排查

### 问题 1：数据库连接失败
- 检查 `POSTGRES_URL` 环境变量
- 确认数据库已创建
- 检查 SSL 配置

### 问题 2：API 请求失败
- 检查 CORS 配置
- 确认 API 路由正确
- 查看 Vercel 函数日志

### 问题 3：环境变量未生效
- 确认在 Vercel Dashboard 中设置
- 重新部署项目
- 清除浏览器缓存

---

## 📚 相关文档

- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel 部署文档](https://vercel.com/docs/deployments)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

## 💡 提示

1. **开发环境**：继续使用 SQLite (`npm run dev:server`)
2. **生产环境**：使用 Vercel Postgres
3. **测试环境**：可以使用 Vercel Preview 部署

---

需要帮助？请查看 [Vercel 支持](https://vercel.com/support)
