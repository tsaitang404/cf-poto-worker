import { generateFileName, isValidImageType, convertToWebP } from '../utils/image.js';

export async function handleUpload(request, env) {
  try {
    // 验证请求方法
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 验证Content-Type
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response('Invalid content type', { status: 400 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const title = formData.get('title');
    const imageFile = formData.get('image');

    // 验证文件
    if (!imageFile || !imageFile.size) {
      return new Response('No image file provided', { status: 400 });
    }

    // 验证文件类型
    if (!isValidImageType(imageFile.type)) {
      return new Response('Invalid image type', { status: 400 });
    }

    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return new Response('File too large (max 10MB)', { status: 400 });
    }

    // 读取文件数据
    const imageBuffer = await imageFile.arrayBuffer();
    
    // 暂时跳过WebP转换，直接使用原始数据
    const webpBuffer = imageBuffer;
    
    // 生成文件名
    const fileName = generateFileName(imageFile.name);
    
    // 上传到R2
    await env.IMAGES_BUCKET.put(fileName, webpBuffer, {
      httpMetadata: {
        contentType: imageFile.type,
      },
    });

    // 保存到数据库
    const stmt = env.DB.prepare(`
      INSERT INTO images (title, filename, original_name, file_size, mime_type, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // 构建公共URL，如果没有设置自定义域名则使用默认格式
    // 注意：在生产环境中，你需要配置R2的自定义域名或公共访问
    const bucketName = 'poto'; // 从wrangler.toml获取
    const publicUrl = env.R2_PUBLIC_URL 
        ? `${env.R2_PUBLIC_URL}/${fileName}`
        : `https://pub-${bucketName}.r2.dev/${fileName}`;
    
    const result = await stmt
      .bind(
        title || imageFile.name,
        fileName,
        imageFile.name,
        webpBuffer.byteLength,
        imageFile.type,
        publicUrl
      )
      .run();

    if (!result.success) {
      throw new Error('Failed to save to database');
    }

    // 返回成功响应
    return Response.json({
      success: true,
      id: result.meta.last_row_id,
      title: title || imageFile.name,
      filename: fileName,
      url: publicUrl,
      size: webpBuffer.byteLength,
      viewUrl: `/image/${result.meta.last_row_id}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload failed: ' + error.message, { status: 500 });
  }
}
