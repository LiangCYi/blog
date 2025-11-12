/**
 * 文章API测试工具
 * 用于验证文章相关接口的功能
 */
import { articleApi } from './api';

/**
 * 测试发表文章接口
 * @param {Object} testData - 测试数据
 */
export const testPublishArticle = async (testData = null) => {
  console.log('=== 开始测试发表文章接口 ===');
  
  // 默认测试数据
  const articleData = testData || {
    title: '测试文章标题',
    category: 'tech',
    tags: ['测试', 'Vue', 'API'],
    content: '这是一篇测试文章，用于验证发表文章接口功能正常工作。',
    coverImage: ''
  };
  
  console.log('测试数据:', articleData);
  
  try {
    const response = await articleApi.publishArticle(articleData);
    console.log('发表文章接口响应成功:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ 发表文章接口测试通过!');
      console.log('文章ID:', response.data.articleId || '未返回');
      return { success: true, data: response.data };
    } else {
      console.error('❌ 发表文章接口返回失败状态:', response.data);
      return { success: false, error: response.data?.message || '未知错误' };
    }
  } catch (error) {
    console.error('❌ 发表文章接口测试失败:', error);
    return { success: false, error: error.message || '网络错误' };
  } finally {
    console.log('=== 发表文章接口测试结束 ===\n');
  }
};

/**
 * 测试上传文章封面图片接口
 * @param {File} file - 测试图片文件
 */
export const testUploadCoverImage = async (file = null) => {
  console.log('=== 开始测试上传封面图片接口 ===');
  
  // 如果没有提供测试文件，创建一个模拟文件
  const testFile = file || new File(['dummy image content'], 'test-image.jpg', { type: 'image/jpeg' });
  
  // 创建FormData
  const formData = new FormData();
  formData.append('image', testFile);
  
  console.log('测试文件:', testFile.name, testFile.size, testFile.type);
  
  try {
    const response = await articleApi.uploadCoverImage(formData, (progress) => {
      console.log('上传进度:', progress + '%');
    });
    
    console.log('上传图片接口响应成功:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ 上传封面图片接口测试通过!');
      console.log('图片URL:', response.data.imageUrl);
      return { success: true, data: response.data };
    } else {
      console.error('❌ 上传封面图片接口返回失败状态:', response.data);
      return { success: false, error: response.data?.message || '未知错误' };
    }
  } catch (error) {
    console.error('❌ 上传封面图片接口测试失败:', error);
    return { success: false, error: error.message || '网络错误' };
  } finally {
    console.log('=== 上传封面图片接口测试结束 ===\n');
  }
};

/**
 * 运行完整的文章API测试套件
 */
export const runArticleApiTests = async () => {
  console.log('🚀 开始运行文章API完整测试套件');
  
  // 测试上传封面图片
  const uploadTest = await testUploadCoverImage();
  
  // 如果上传成功，使用返回的图片URL进行发表文章测试
  if (uploadTest.success) {
    const articleData = {
      title: '测试文章(含封面)',
      category: 'tech',
      tags: ['测试', 'Vue', '封面图片'],
      content: '这是一篇带封面图片的测试文章，用于验证完整的发表流程。',
      coverImage: uploadTest.data.imageUrl
    };
    
    await testPublishArticle(articleData);
  } else {
    // 如果上传失败，使用无封面的方式测试发表文章
    await testPublishArticle();
  }
  
  console.log('📝 文章API测试套件运行完毕');
};

// 导出测试工具
export default {
  testPublishArticle,
  testUploadCoverImage,
  runArticleApiTests
};

// 示例使用方法
/*
import articleApiTest from './testArticleApi';

// 在组件中需要时调用
// articleApiTest.runArticleApiTests();
*/