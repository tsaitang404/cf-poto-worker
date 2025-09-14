import { convertToWebP } from '../utils/image.js';

/**
 * 处理图片格式转换下载
 * @param {Request} request 
 * @param {Object} env 
 * @param {string} imageId 
 * @param {string} format 
 * @returns 
 */
export async function handleConvert(request, env, imageId, format) {
  try {
    // 从数据库获取图片信息
    const stmt = env.DB.prepare('SELECT * FROM images WHERE id = ?');
    const image = await stmt.bind(imageId).first();
    
    if (!image) {
      return new Response('Image not found', { status: 404 });
    }

    // 检查是否需要转换（如果目标格式与当前格式相同）
    const currentFormat = image.mime_type.split('/')[1];
    if (currentFormat === format.toLowerCase() || 
        (currentFormat === 'jpg' && format.toLowerCase() === 'jpeg')) {
      // 直接返回原文件
      const object = await env.IMAGES_BUCKET.get(image.filename);
      if (!object) {
        return new Response('Image file not found', { status: 404 });
      }
      
      const originalName = image.original_name.replace(/\.[^.]+$/, '');
      const downloadFilename = `${originalName}.${format.toLowerCase()}`;
      
      return new Response(object.body, {
        headers: {
          'Content-Type': image.mime_type,
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }

    // 从R2获取原始图片数据进行转换
    const object = await env.IMAGES_BUCKET.get(image.filename);
    if (!object) {
      return new Response('Image file not found', { status: 404 });
    }

    const imageBuffer = await object.arrayBuffer();
    
    // 支持的输出格式
    const supportedFormats = ['webp', 'jpeg', 'png'];
    if (!supportedFormats.includes(format.toLowerCase())) {
      return new Response('Unsupported format', { status: 400 });
    }

    let convertedBuffer;
    let outputMimeType;
    let fileExtension;

    switch (format.toLowerCase()) {
      case 'webp':
        convertedBuffer = await convertToWebP(imageBuffer, image.mime_type, 80);
        outputMimeType = 'image/webp';
        fileExtension = 'webp';
        break;
        
      case 'jpeg':
      case 'jpg':
        convertedBuffer = await convertToJPEG(imageBuffer, image.mime_type, 85);
        outputMimeType = 'image/jpeg';
        fileExtension = 'jpg';
        break;
        
      case 'png':
        convertedBuffer = await convertToPNG(imageBuffer, image.mime_type);
        outputMimeType = 'image/png';
        fileExtension = 'png';
        break;
        
      default:
        return new Response('Unsupported format', { status: 400 });
    }

    // 生成下载文件名
    const originalName = image.original_name.replace(/\.[^.]+$/, '');
    const downloadFilename = `${originalName}_converted.${fileExtension}`;

    // 返回转换后的文件
    return new Response(convertedBuffer, {
      headers: {
        'Content-Type': outputMimeType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Cache-Control': 'public, max-age=31536000'
      }
    });

  } catch (error) {
    console.error('Convert error:', error);
    return new Response('Conversion failed: ' + error.message, { status: 500 });
  }
}

/**
 * 将图片转换为JPEG格式
 * @param {ArrayBuffer} imageBuffer 
 * @param {string} sourceMimeType 
 * @param {number} quality 
 * @returns {Promise<ArrayBuffer>}
 */
async function convertToJPEG(imageBuffer, sourceMimeType, quality = 85) {
  try {
    // 如果已经是JPEG格式，直接返回
    if (sourceMimeType === 'image/jpeg' || sourceMimeType === 'image/jpg') {
      return imageBuffer;
    }

    // 使用Canvas进行格式转换
    const blob = new Blob([imageBuffer], { type: sourceMimeType });
    const imageBitmap = await createImageBitmap(blob);
    
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    
    // 为JPEG格式填充白色背景（因为JPEG不支持透明度）
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageBitmap, 0, 0);
    
    // 转换为JPEG blob
    const jpegBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality / 100
    });
    
    return await jpegBlob.arrayBuffer();
    
  } catch (error) {
    console.error('JPEG conversion failed:', error);
    return imageBuffer;
  }
}

/**
 * 将图片转换为PNG格式
 * @param {ArrayBuffer} imageBuffer 
 * @param {string} sourceMimeType 
 * @returns {Promise<ArrayBuffer>}
 */
async function convertToPNG(imageBuffer, sourceMimeType) {
  try {
    // 如果已经是PNG格式，直接返回
    if (sourceMimeType === 'image/png') {
      return imageBuffer;
    }

    // 使用Canvas进行格式转换
    const blob = new Blob([imageBuffer], { type: sourceMimeType });
    const imageBitmap = await createImageBitmap(blob);
    
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);
    
    // 转换为PNG blob
    const pngBlob = await canvas.convertToBlob({
      type: 'image/png'
    });
    
    return await pngBlob.arrayBuffer();
    
  } catch (error) {
    console.error('PNG conversion failed:', error);
    return imageBuffer;
  }
}