const BASE_URL = 'http://localhost:3001/api';

let testUserId = null;

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  console.log(`\n${method} ${endpoint}`);
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  return { status: response.status, data };
}

async function runTests() {
  console.log('🧪 DIETGYM API 测试开始\n');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n📋 测试 1: 健康检查');
    await request('GET', '/health');
    
    console.log('\n📋 测试 2: 创建用户');
    const createRes = await request('POST', '/users', {
      username: `test_user_${Date.now()}`,
      display_name: '测试用户',
      weight: 70,
      height: 175
    });
    testUserId = createRes.data.data.id;
    
    console.log('\n📋 测试 3: 获取用户信息');
    await request('GET', `/users/${testUserId}`);
    
    console.log('\n📋 测试 4: 更新用户信息');
    await request('PUT', `/users/${testUserId}`, {
      weight: 72,
      display_name: '更新后的用户'
    });
    
    console.log('\n📋 测试 5: 获取用户目标');
    await request('GET', `/users/${testUserId}/goals`);
    
    console.log('\n📋 测试 6: 更新用户目标');
    await request('PUT', `/users/${testUserId}/goals`, {
      calories: 2000,
      protein: 150,
      carbs: 220,
      fat: 65
    });
    
    console.log('\n📋 测试 7: 添加食物记录');
    await request('POST', '/food', {
      user_id: testUserId,
      food_name: '鸡胸肉沙拉',
      calories: 350,
      protein: 30,
      carbs: 20,
      fat: 15
    });
    
    console.log('\n📋 测试 8: 添加另一个食物记录');
    await request('POST', '/food', {
      user_id: testUserId,
      food_name: '燕麦粥',
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 5
    });
    
    console.log('\n📋 测试 9: 获取今日食物记录');
    await request('GET', `/food/${testUserId}`);
    
    console.log('\n📋 测试 10: 添加运动记录');
    await request('POST', '/workouts', {
      user_id: testUserId,
      workout_name: '跑步',
      calories_burned: 300,
      duration_minutes: 30
    });
    
    console.log('\n📋 测试 11: 获取今日运动记录');
    await request('GET', `/workouts/${testUserId}`);
    
    console.log('\n📋 测试 12: 获取每日统计');
    await request('GET', `/food/${testUserId}/stats`);
    
    console.log('\n📋 测试 13: 测试错误处理 - 用户不存在');
    await request('GET', '/users/99999');
    
    console.log('\n📋 测试 14: 测试错误处理 - 缺少必需字段');
    await request('POST', '/food', {
      user_id: testUserId
    });
    
    console.log('\n✅ 所有测试完成！');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('请确保后端服务器正在运行: npm run dev:server');
  }
}

runTests();
