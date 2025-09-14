import webp from '@saschazar/wasm-webp';

/**
 * 将图片转换为WebP格式
 * @param {ArrayBuffer} imageBuffer - 原始图片数据
 * @param {string} mimeType - 原始图片MIME类型
 * @param {number} quality - 压缩质量 (0-100)
 * @returns {Promise<ArrayBuffer>} 转换后的WebP数据
 */
export async function convertToWebP(imageBuffer, mimeType, quality = 80) {
  try {
    // 如果已经是WebP格式，直接返回
    if (mimeType === 'image/webp') {
      return imageBuffer;
    }

    console.log(`Converting ${mimeType} to WebP with quality: ${quality}`);
    
    // 初始化WebP编码器
    await webp.init();
    
    // 创建输入buffer
    const inputBuffer = new Uint8Array(imageBuffer);
    
    // 根据原始格式进行解码
    let rgbaData;
    let width, height;
    
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      // 对于JPEG，我们需要先解码为RGBA
      const result = await decodeJPEG(inputBuffer);
      rgbaData = result.data;
      width = result.width;
      height = result.height;
    } else if (mimeType === 'image/png') {
      // 对于PNG，解码为RGBA
      const result = await decodePNG(inputBuffer);
      rgbaData = result.data;
      width = result.width;
      height = result.height;
    } else {
      // 对于其他格式，暂时返回原始数据
      console.warn(`Unsupported format for WebP conversion: ${mimeType}`);
      return imageBuffer;
    }
    
    // 编码为WebP
    const webpData = webp.encode(rgbaData, width, height, {
      quality: quality,
      method: 6, // 最佳压缩方法
      exact: false
    });
    
    if (!webpData) {
      throw new Error('WebP encoding failed');
    }
    
    console.log(`WebP conversion successful. Original: ${imageBuffer.byteLength} bytes, WebP: ${webpData.length} bytes`);
    return webpData.buffer;
    
  } catch (error) {
    console.error('WebP conversion failed:', error);
    // 如果转换失败，返回原始数据
    return imageBuffer;
  }
}

/**
 * 简单的JPEG解码（使用Canvas API替代方案）
 * 注意：这是一个简化的实现，在实际生产中可能需要更完善的解码器
 */
async function decodeJPEG(buffer) {
  // 在Workers环境中，我们使用ImageData API
  // 这需要创建一个临时的Image对象
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const imageBitmap = await createImageBitmap(blob);
  
  // 创建OffscreenCanvas来获取像素数据
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  
  return {
    data: imageData.data,
    width: imageBitmap.width,
    height: imageBitmap.height
  };
}

/**
 * 简单的PNG解码
 */
async function decodePNG(buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  const imageBitmap = await createImageBitmap(blob);
  
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  
  return {
    data: imageData.data,
    width: imageBitmap.width,
    height: imageBitmap.height
  };
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
