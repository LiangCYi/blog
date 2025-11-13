/**
 * 测试所有文章相关功能的工具函数
 * 包括：发表文章、编辑文章、删除文章、查看文章详情、我的文章列表、文章搜索等
 */
import { articleApi } from './api';

/**
 * 测试文章发表功能
 * @returns {Promise<Object>} 测试结果
 */
export async function testPublishArticle() {
  console.log('=== 开始测试文章发表功能 ===');
  
  try {
    const articleData = {
      title: '测试文章标题',
      content: '<h2>测试文章内容</h2><p>这是一篇用于测试的文章内容。</p>',
      category: 'tech',
      tags: ['测试', 'Vue'],
      status: 1 // 1表示已发布，0表示草稿
    };
    
    console.log('发表文章数据:', articleData);
    const response = await articleApi.publishArticle(articleData);
    
    if (response.data && response.data.success) {
      console.log('✅ 文章发表成功！');
      console.log('发表的文章数据:', response.data.data);
      return {
        success: true,
        articleId: response.data.data?.id,
        message: '文章发表成功',
        data: response.data.data
      };
    } else {
      console.error('❌ 文章发表失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '发表失败'
      };
    }
  } catch (error) {
    console.error('❌ 文章发表出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试文章编辑功能
 * @param {number} articleId - 要编辑的文章ID
 * @returns {Promise<Object>} 测试结果
 */
export async function testUpdateArticle(articleId) {
  console.log(`=== 开始测试文章编辑功能 (ID: ${articleId}) ===`);
  
  try {
    const updateData = {
      title: '测试文章标题 - 已更新',
      content: '<h2>更新后的测试内容</h2><p>这是更新后的文章内容。</p>',
      category: 'tech',
      tags: ['测试', 'Vue', '更新'],
      status: 1
    };
    
    console.log('更新文章数据:', updateData);
    const response = await articleApi.updateArticle(articleId, updateData);
    
    if (response.data && response.data.success) {
      console.log('✅ 文章更新成功！');
      console.log('更新后的文章数据:', response.data.data);
      return {
        success: true,
        message: '文章更新成功',
        data: response.data.data
      };
    } else {
      console.error('❌ 文章更新失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '更新失败'
      };
    }
  } catch (error) {
    console.error('❌ 文章更新出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试文章删除功能
 * @param {number} articleId - 要删除的文章ID
 * @returns {Promise<Object>} 测试结果
 */
export async function testDeleteArticle(articleId) {
  console.log(`=== 开始测试文章删除功能 (ID: ${articleId}) ===`);
  
  try {
    const response = await articleApi.deleteArticle(articleId);
    
    if (response.data && response.data.success) {
      console.log('✅ 文章删除成功！');
      return {
        success: true,
        message: '文章删除成功'
      };
    } else {
      console.error('❌ 文章删除失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '删除失败'
      };
    }
  } catch (error) {
    console.error('❌ 文章删除出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试获取文章详情功能
 * @param {number} articleId - 文章ID
 * @returns {Promise<Object>} 测试结果
 */
export async function testGetArticleDetail(articleId) {
  console.log(`=== 开始测试获取文章详情功能 (ID: ${articleId}) ===`);
  
  try {
    const response = await articleApi.getArticleDetail(articleId);
    
    if (response.data && response.data.success) {
      console.log('✅ 获取文章详情成功！');
      console.log('文章详情数据:', response.data.data);
      return {
        success: true,
        message: '获取文章详情成功',
        data: response.data.data
      };
    } else {
      console.error('❌ 获取文章详情失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '获取失败'
      };
    }
  } catch (error) {
    console.error('❌ 获取文章详情出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试获取我的文章列表功能
 * @param {Object} params - 分页和筛选参数
 * @returns {Promise<Object>} 测试结果
 */
export async function testGetMyArticles(params = { page: 0, size: 10 }) {
  console.log('=== 开始测试获取我的文章列表功能 ===');
  console.log('请求参数:', params);
  
  try {
    const response = await articleApi.getMyArticles(params);
    
    if (response.data && response.data.success) {
      console.log(`✅ 获取我的文章列表成功！共 ${response.data.data?.length || 0} 篇文章`);
      console.log('分页信息:', response.data.pagination);
      return {
        success: true,
        message: '获取我的文章列表成功',
        data: response.data.data,
        pagination: response.data.pagination
      };
    } else {
      console.error('❌ 获取我的文章列表失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '获取失败'
      };
    }
  } catch (error) {
    console.error('❌ 获取我的文章列表出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试文章搜索功能
 * @param {Object} params - 搜索参数
 * @returns {Promise<Object>} 测试结果
 */
export async function testSearchArticles(params = { keyword: '测试', status: 1, page: 0, size: 10 }) {
  console.log('=== 开始测试文章搜索功能 ===');
  console.log('搜索参数:', params);
  
  try {
    const response = await articleApi.searchArticles(params);
    
    if (response.data && response.data.success) {
      console.log(`✅ 文章搜索成功！找到 ${response.data.data?.length || 0} 篇匹配的文章`);
      console.log('分页信息:', response.data.pagination);
      return {
        success: true,
        message: '文章搜索成功',
        data: response.data.data,
        pagination: response.data.pagination
      };
    } else {
      console.error('❌ 文章搜索失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '搜索失败'
      };
    }
  } catch (error) {
    console.error('❌ 文章搜索出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 测试上传封面图片功能
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 测试结果
 */
export async function testUploadCoverImage(file) {
  console.log('=== 开始测试上传封面图片功能 ===');
  
  try {
    if (!file) {
      throw new Error('没有提供图片文件');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('上传文件:', file.name);
    const response = await articleApi.uploadCoverImage(formData);
    
    if (response.data && response.data.success) {
      console.log('✅ 封面图片上传成功！');
      console.log('图片URL:', response.data.data?.url);
      return {
        success: true,
        message: '封面图片上传成功',
        data: response.data.data
      };
    } else {
      console.error('❌ 封面图片上传失败:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || '上传失败'
      };
    }
  } catch (error) {
    console.error('❌ 封面图片上传出错:', error);
    return {
      success: false,
      message: error.response?.data?.message || '网络错误'
    };
  }
}

/**
 * 运行完整的文章功能测试套件
 * @returns {Promise<Object>} 测试套件结果
 */
export async function runArticleFeatureTests() {
  console.log('========================================');
  console.log('🔄 开始运行完整的文章功能测试套件');
  console.log('========================================');
  
  const results = {
    publish: null,
    detail: null,
    update: null,
    myArticles: null,
    search: null,
    delete: null
  };
  
  let testArticleId = null;
  
  try {
    // 1. 测试发表文章
    results.publish = await testPublishArticle();
    if (results.publish.success) {
      testArticleId = results.publish.articleId;
      
      // 2. 测试获取文章详情
      results.detail = await testGetArticleDetail(testArticleId);
      
      // 3. 测试更新文章
      results.update = await testUpdateArticle(testArticleId);
      
      // 4. 测试获取我的文章列表
      results.myArticles = await testGetMyArticles();
      
      // 5. 测试文章搜索
      results.search = await testSearchArticles({ keyword: '测试', status: 1 });
      
      // 6. 测试删除文章
      results.delete = await testDeleteArticle(testArticleId);
    }
    
  } catch (error) {
    console.error('❌ 测试套件运行出错:', error);
  }
  
  console.log('========================================');
  console.log('📊 测试套件运行结果汇总');
  console.log('========================================');
  
  let totalPassed = 0;
  let totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([key, result]) => {
    if (result && result.success) {
      totalPassed++;
      console.log(`✅ ${key}: ${result.message}`);
    } else {
      console.log(`❌ ${key}: ${result?.message || '未执行'}`);
    }
  });
  
  console.log('========================================');
  console.log(`🏁 测试完成: ${totalPassed}/${totalTests} 通过`);
  console.log('========================================');
  
  return {
    overallSuccess: totalPassed === totalTests,
    passedCount: totalPassed,
    totalCount: totalTests,
    results
  };
}

// 在浏览器控制台中导出便于使用的方法
if (typeof window !== 'undefined') {
  window.articleTests = {
    runAll: runArticleFeatureTests,
    publish: testPublishArticle,
    update: testUpdateArticle,
    delete: testDeleteArticle,
    detail: testGetArticleDetail,
    myArticles: testGetMyArticles,
    search: testSearchArticles,
    uploadImage: testUploadCoverImage
  };
}

export default {
  runArticleFeatureTests,
  testPublishArticle,
  testUpdateArticle,
  testDeleteArticle,
  testGetArticleDetail,
  testGetMyArticles,
  testSearchArticles,
  testUploadCoverImage
};