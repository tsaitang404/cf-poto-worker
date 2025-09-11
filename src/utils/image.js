/**
 * 将图片转换为WebP格式
 * 注意：在Cloudflare Workers环境中，图片转换功能有限
 * 这里我们直接返回原始数据，可以考虑使用其他服务进行转换
 * @param {ArrayBuffer} imageBuffer - 原始图片数据
 * @param {number} quality - 压缩质量 (0-100)
 * @returns {Promise<ArrayBuffer>} 转换后的WebP数据
 */
export async function convertToWebP(imageBuffer, quality = 80) {
  try {
    // 在生产环境中，你可能需要使用专门的图片处理服务
    // 如 Cloudflare Images API 或其他第三方服务
    // 这里我们暂时返回原始数据
    console.log(`Image conversion requested with quality: ${quality}`);
    
    // TODO: 实现实际的WebP转换逻辑
    // 可能的方案：
    // 1. 使用 Cloudflare Images API
    // 2. 使用第三方图片处理服务
    // 3. 在客户端进行转换
    
    return imageBuffer;
  } catch (error) {
    console.error('WebP conversion failed:', error);
    return imageBuffer;
  }
}

/**
 * 生成唯一的文件名
 * @param {string} originalName - 原始文件名
 * @returns {string} 新的文件名
 */
export function generateFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const ext = originalName ? originalName.split('.').pop() : 'webp';
  
  return `${timestamp}-${random}.webp`;
}

/**
 * 验证图片文件类型
 * @param {string} mimeType - MIME类型
 * @returns {boolean} 是否为有效的图片类型
 */
export function isValidImageType(mimeType) {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  
  return validTypes.includes(mimeType);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
