# DIETGYM API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 用户管理 API

### 1. 创建用户

**POST** `/users`

创建新用户账号。

**请求体**:
```json
{
  "username": "user123",
  "display_name": "张三",
  "weight": 70,
  "height": 175
}
```

**响应** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "display_name": "张三",
    "weight": 70,
    "height": 175,
    "created_at": "2025-03-03T10:00:00.000Z",
    "updated_at": "2025-03-03T10:00:00.000Z"
  },
  "message": "User created successfully"
}
```

### 2. 获取用户信息

**GET** `/users/:userId`

获取指定用户的详细信息。

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "display_name": "张三",
    "weight": 70,
    "height": 175,
    "created_at": "2025-03-03T10:00:00.000Z",
    "updated_at": "2025-03-03T10:00:00.000Z"
  }
}
```

### 3. 更新用户信息

**PUT** `/users/:userId`

更新用户的个人信息。

**请求体**:
```json
{
  "display_name": "李四",
  "weight": 68,
  "height": 176
}
```

**响应** (200):
```json
{
  "success": true,
  "data": { /* 更新后的用户对象 */ },
  "message": "User updated successfully"
}
```

### 4. 获取用户每日目标

**GET** `/users/:userId/goals?date=YYYY-MM-DD`

获取用户指定日期的营养目标。如果不提供日期，返回今天的目标。

**查询参数**:
- `date` (可选): 日期，格式 YYYY-MM-DD

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "date": "2025-03-03",
    "calories": 2200,
    "protein": 140,
    "carbs": 250,
    "fat": 70,
    "created_at": "2025-03-03T10:00:00.000Z"
  }
}
```

### 5. 更新用户每日目标

**PUT** `/users/:userId/goals`

更新用户指定日期的营养目标。

**请求体**:
```json
{
  "calories": 2000,
  "protein": 150,
  "carbs": 220,
  "fat": 65,
  "date": "2025-03-03"
}
```

**响应** (200):
```json
{
  "success": true,
  "data": { /* 更新后的目标对象 */ },
  "message": "Goals updated successfully"
}
```

---

## 食物记录 API

### 1. 添加食物记录

**POST** `/food`

记录用户摄入的食物。

**请求体**:
```json
{
  "user_id": 1,
  "food_name": "鸡胸肉沙拉",
  "calories": 350,
  "protein": 30,
  "carbs": 20,
  "fat": 15,
  "image_url": "https://example.com/image.jpg",
  "date": "2025-03-03"
}
```

**响应** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "food_name": "鸡胸肉沙拉",
    "calories": 350,
    "protein": 30,
    "carbs": 20,
    "fat": 15,
    "image_url": "https://example.com/image.jpg",
    "logged_at": "2025-03-03T12:00:00.000Z",
    "date": "2025-03-03"
  },
  "message": "Food logged successfully"
}
```

### 2. 获取食物记录（按日期）

**GET** `/food/:userId?date=YYYY-MM-DD`

获取用户指定日期的食物记录。

**查询参数**:
- `date` (可选): 日期，格式 YYYY-MM-DD，默认今天

**响应** (200):
```json
{
  "success": true,
  "data": [
    { /* 食物记录对象 */ },
    { /* 食物记录对象 */ }
  ]
}
```

### 3. 获取食物记录（按日期范围）

**GET** `/food/:userId/range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

获取用户指定日期范围内的食物记录。

**查询参数**:
- `start_date` (必需): 开始日期
- `end_date` (必需): 结束日期

**响应** (200):
```json
{
  "success": true,
  "data": [
    { /* 食物记录对象 */ }
  ]
}
```

### 4. 删除食物记录

**DELETE** `/food/:logId`

删除指定的食物记录。

**响应** (200):
```json
{
  "success": true,
  "message": "Food log deleted successfully"
}
```

### 5. 获取每日统计

**GET** `/food/:userId/stats?date=YYYY-MM-DD`

获取用户指定日期的营养摄入统计和目标对比。

**查询参数**:
- `date` (可选): 日期，格式 YYYY-MM-DD，默认今天

**响应** (200):
```json
{
  "success": true,
  "data": {
    "date": "2025-03-03",
    "calories_in": 1800,
    "calories_out": 300,
    "protein_in": 120,
    "carbs_in": 200,
    "fat_in": 60,
    "goals": {
      "calories": 2200,
      "protein": 140,
      "carbs": 250,
      "fat": 70
    }
  }
}
```

---

## 运动记录 API

### 1. 添加运动记录

**POST** `/workouts`

记录用户的运动数据。

**请求体**:
```json
{
  "user_id": 1,
  "workout_name": "跑步",
  "calories_burned": 300,
  "duration_minutes": 30,
  "date": "2025-03-03"
}
```

**响应** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "workout_name": "跑步",
    "calories_burned": 300,
    "duration_minutes": 30,
    "logged_at": "2025-03-03T14:00:00.000Z",
    "date": "2025-03-03"
  },
  "message": "Workout logged successfully"
}
```

### 2. 获取运动记录（按日期）

**GET** `/workouts/:userId?date=YYYY-MM-DD`

获取用户指定日期的运动记录。

**查询参数**:
- `date` (可选): 日期，格式 YYYY-MM-DD，默认今天

**响应** (200):
```json
{
  "success": true,
  "data": [
    { /* 运动记录对象 */ }
  ]
}
```

### 3. 获取运动记录（按日期范围）

**GET** `/workouts/:userId/range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

获取用户指定日期范围内的运动记录。

**查询参数**:
- `start_date` (必需): 开始日期
- `end_date` (必需): 结束日期

**响应** (200):
```json
{
  "success": true,
  "data": [
    { /* 运动记录对象 */ }
  ]
}
```

### 4. 删除运动记录

**DELETE** `/workouts/:logId`

删除指定的运动记录。

**响应** (200):
```json
{
  "success": true,
  "message": "Workout log deleted successfully"
}
```

---

## 健康检查

### GET /api/health

检查 API 服务状态。

**响应** (200):
```json
{
  "success": true,
  "message": "DIETGYM API is running",
  "timestamp": "2025-03-03T10:00:00.000Z"
}
```

---

## 错误响应

所有错误响应遵循以下格式：

```json
{
  "success": false,
  "error": "Error message description"
}
```

**常见错误码**:
- `400 Bad Request` - 请求参数错误
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突（如用户名已存在）
- `500 Internal Server Error` - 服务器内部错误

---

## 数据验证规则

### 用户数据
- `username`: 必需，唯一
- `weight`: 数字，默认 70
- `height`: 数字，默认 175

### 食物记录
- `food_name`: 必需，字符串
- `calories`, `protein`, `carbs`, `fat`: 必需，非负数字

### 运动记录
- `workout_name`: 必需，字符串
- `calories_burned`: 必需，非负数字
- `duration_minutes`: 可选，数字

### 日期格式
- 所有日期参数使用 `YYYY-MM-DD` 格式
