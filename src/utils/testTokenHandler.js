/**
 * Token Handler 功能测试文件
 * 注意：此文件仅用于开发测试，实际部署时应移除
 */

import {
  getToken,
  setToken,
  clearToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  handleTokenExpiry,
  setupTokenExpiryListener,
  clearTokenExpiryListener,
  isValidToken,
  getTokenRemainingTime
} from './tokenHandler.js';

// 创建测试用的JWT token（包含过期时间）
const createTestToken = (expiresInSeconds = 3600) => {
  // 创建一个测试用的token，设置过期时间
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub: '1234567890', name: 'Test User', exp: exp };
  
  // Base64编码（简化版本，仅用于测试）
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '');
  
  // 模拟签名（实际项目中由服务器生成）
  const signature = 'test_signature';
  
  return `${encode(header)}.${encode(payload)}.${signature}`;
};

// 创建过期的token
const createExpiredToken = () => {
  return createTestToken(-3600); // 过期1小时
};

// 测试函数
const runTokenTests = () => {
  console.log('=== 开始 Token Handler 功能测试 ===');
  
  try {
    // 清除之前的测试数据
    clearToken();
    console.log('✓ 清除token成功');
    
    // 测试1: 获取不存在的token
    const emptyToken = getToken();
    console.log(`✓ 获取不存在的token: ${emptyToken === null ? 'null' : emptyToken}`);
    
    // 测试2: 设置和获取token
    const testToken = createTestToken();
    setToken(testToken);
    const retrievedToken = getToken();
    console.log(`✓ 设置和获取token: ${retrievedToken === testToken ? '成功' : '失败'}`);
    
    // 测试3: 解码token
    const decodedToken = decodeToken(testToken);
    console.log(`✓ 解码token: ${decodedToken ? '成功' : '失败'}`);
    if (decodedToken) {
      console.log(`  - Token内容: ${JSON.stringify(decodedToken)}`);
    }
    
    // 测试4: 检查有效token是否过期
    const isValid = !isTokenExpired(testToken);
    console.log(`✓ 检查有效token是否过期: ${isValid ? '未过期' : '已过期'}`);
    
    // 测试5: 获取token过期时间
    const expiry = getTokenExpiry(testToken);
    console.log(`✓ 获取token过期时间: ${expiry ? expiry.toISOString() : '无效'}`);
    
    // 测试6: 获取token剩余时间
    const remaining = getTokenRemainingTime(testToken);
    console.log(`✓ 获取token剩余时间: ${remaining}秒`);
    
    // 测试7: 检查token是否有效
    const tokenValid = isValidToken(testToken);
    console.log(`✓ 验证token是否有效: ${tokenValid ? '有效' : '无效'}`);
    
    // 测试8: 创建并测试过期token
    const expiredToken = createExpiredToken();
    setToken(expiredToken);
    const isExpired = isTokenExpired();
    console.log(`✓ 检查过期token: ${isExpired ? '已过期' : '未过期'}`);
    
    // 测试9: 验证过期token是否无效
    const expiredValid = isValidToken(expiredToken);
    console.log(`✓ 验证过期token是否无效: ${!expiredValid ? '无效（正确）' : '有效（错误）'}`);
    
    // 测试10: 过期token的剩余时间
    const expiredRemaining = getTokenRemainingTime(expiredToken);
    console.log(`✓ 过期token的剩余时间: ${expiredRemaining}秒`);
    
    // 注意：handleTokenExpiry和setupTokenExpiryListener修改应用状态，此处不实际调用
    console.log('✓ 提示: handleTokenExpiry和setupTokenExpiryListener函数已在main.js中初始化');
    
    console.log('=== Token Handler 功能测试完成 ===');
    return true;
  } catch (error) {
    console.error('=== 测试失败 ===', error);
    return false;
  }
};

// 如果在开发环境中直接运行此文件
if (typeof window !== 'undefined') {
  // 添加一个测试按钮到控制台
  window.testTokenHandler = runTokenTests;
  console.log('Token Handler测试函数已挂载到window.testTokenHandler');
  console.log('在控制台中输入 window.testTokenHandler() 运行测试');
}

export { runTokenTests };

// 默认导出
const tokenTester = {
  runTests: runTokenTests,
  createTestToken,
  createExpiredToken
};

export default tokenTester;