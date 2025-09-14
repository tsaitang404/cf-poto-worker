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

    // 兼容字段名：image（单/多），images（多）
    let files = [];
    const imagesByImage = formData.getAll('image').filter(Boolean);
    const imagesByImages = formData.getAll('images').filter(Boolean);
    if (imagesByImage.length > 0) files = imagesByImage;
    if (imagesByImages.length > 0) files = files.concat(imagesByImages);

    // 回退：部分浏览器只会把第一个文件放在 get('image')
    if (files.length === 0) {
      const single = formData.get('image');
      if (single) files = [single];
    }

    // 验证是否提供文件
    if (!files.length) {
      return new Response('No image file provided', { status: 400 });
    }

    // 公共配置
    const maxSize = 10 * 1024 * 1024; // 10MB
    const bucketName = 'poto'; // 可从 env 中读取配置，这里保持与现有逻辑一致
    const insertStmt = env.DB.prepare(`
      INSERT INTO images (title, filename, original_name, file_size, mime_type, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const successes = [];
    const failures = [];

    // 顺序处理，避免内存峰值
    for (const file of files) {
      try {
        if (!file || !file.size) {
          throw new Error('Empty file');
        }
        if (!isValidImageType(file.type)) {
          throw new Error('Invalid image type');
        }
        if (file.size > maxSize) {
          throw new Error('File too large (max 10MB)');
        }

        const imageBuffer = await file.arrayBuffer();
        const webpBuffer = await convertToWebP(imageBuffer, file.type, 80);
        const fileName = generateFileName(file.name);

        // 生成公共URL（支持自定义域名）
        const publicUrl = env.R2_PUBLIC_URL
          ? `${env.R2_PUBLIC_URL}/${fileName}`
          : `https://pub-${bucketName}.r2.dev/${fileName}`;

        await env.IMAGES_BUCKET.put(fileName, webpBuffer, {
          httpMetadata: { contentType: 'image/webp' },
        });

        const result = await insertStmt
          .bind(
            (title && title.toString().trim()) || file.name,
            fileName,
            file.name,
            webpBuffer.byteLength,
            'image/webp',
            publicUrl
          )
          .run();

        if (!result.success) {
          throw new Error('Failed to save to database');
        }

        const id = result.meta.last_row_id;
        successes.push({
          id,
          title: (title && title.toString().trim()) || file.name,
          filename: fileName,
          url: publicUrl,
          size: webpBuffer.byteLength,
          viewUrl: `/image/${id}`
        });
      } catch (e) {
        console.error('File upload failed:', e);
        failures.push({ name: file?.name || 'unknown', reason: e.message || 'unknown error' });
      }
    }

    // 构造响应
    if (successes.length === 0) {
      return Response.json({ success: false, message: failures[0]?.reason || 'Upload failed', failures }, { status: 400 });
    }

    if (successes.length === 1) {
      const s = successes[0];
      return Response.json({
        success: true,
        id: s.id,
        title: s.title,
        filename: s.filename,
        url: s.url,
        size: s.size,
        viewUrl: s.viewUrl,
        failures
      });
    }

    return Response.json({
      success: true,
      count: successes.length,
      items: successes,
      failures,
      viewUrls: successes.map(s => s.viewUrl)
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload failed: ' + error.message, { status: 500 });
  }
}
