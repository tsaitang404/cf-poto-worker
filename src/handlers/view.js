export async function handleView(request, env, imageId) {
  try {
    // 从数据库获取图片信息
    const stmt = env.DB.prepare('SELECT * FROM images WHERE id = ?');
    const image = await stmt.bind(imageId).first();
    
    if (!image) {
      return new Response('Image not found', { status: 404 });
    }

    // 返回图片查看页面的HTML
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${image.title} - 图片查看</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 800px;
            width: 100%;
            text-align: center;
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2em;
        }
        
        .image-container {
            margin: 30px 0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .image-container img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        
        .image-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        
        .info-value {
            color: #6c757d;
            word-break: break-all;
        }
        
        .url-copy {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .url-copy:hover {
            background: #0056b3;
        }
        
        .actions {
            margin-top: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #0056b3;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .download-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .download-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .download-options {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .download-btn:hover {
            background: #218838;
        }
        
        .download-btn:before {
            content: "⬇";
            margin-right: 5px;
        }
        
        @media (max-width: 600px) {
            .download-options {
                flex-direction: column;
            }
            
            .download-btn {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${image.title}</h1>
        
        <div class="image-container">
            <img src="${image.url}" alt="${image.title}" loading="lazy">
        </div>
        
        <div class="image-info">
            <div class="info-item">
                <span class="info-label">文件名:</span>
                <span class="info-value">${image.filename}</span>
            </div>
            <div class="info-item">
                <span class="info-label">原始文件名:</span>
                <span class="info-value">${image.original_name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">文件大小:</span>
                <span class="info-value">${formatFileSize(image.file_size)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">上传时间:</span>
                <span class="info-value">${new Date(image.uploaded_at).toLocaleString('zh-CN')}</span>
            </div>
            <div class="info-item">
                <span class="info-label">图片链接:</span>
                <div>
                    <span class="info-value" id="imageUrl">${image.url}</span>
                    <button class="url-copy" onclick="copyUrl()">复制</button>
                </div>
            </div>
        </div>
        
        <div class="download-section">
            <div class="download-title">格式转换下载</div>
            <div class="download-options">
                <a href="/convert/${imageId}/webp" class="download-btn">WebP 格式</a>
                <a href="/convert/${imageId}/jpeg" class="download-btn">JPEG 格式</a>
                <a href="/convert/${imageId}/png" class="download-btn">PNG 格式</a>
            </div>
        </div>
        
        <div class="actions">
            <a href="/upload" class="btn">上传新图片</a>
            <a href="${image.url}" target="_blank" class="btn btn-secondary">在新窗口查看</a>
        </div>
    </div>
    
    <script>
        function copyUrl() {
            const url = document.getElementById('imageUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制到剪贴板！');
            }).catch(() => {
                // 兼容旧版浏览器
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('链接已复制到剪贴板！');
            });
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
    
  } catch (error) {
    console.error('View error:', error);
    return new Response('Error loading image', { status: 500 });
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function handleBatchView(request, env) {
    try {
        const url = new URL(request.url);
        const idsParam = url.searchParams.get('ids');
        if (!idsParam) {
            return new Response('Missing ids parameter', { status: 400 });
        }
        const ids = idsParam
            .split(',')
            .map(s => s.trim())
            .filter(s => s && /^\d+$/.test(s));
        if (ids.length === 0) {
            return new Response('No valid ids provided', { status: 400 });
        }

        // 查询多条记录
        const placeholders = ids.map(() => '?').join(',');
        const stmt = env.DB.prepare(`SELECT * FROM images WHERE id IN (${placeholders}) ORDER BY uploaded_at DESC`);
        const result = await stmt.bind(...ids).all();
        const images = result?.results || [];

        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>批量查看 - Poto 图床</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f7fb; margin: 0; }
        .topbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 20px; text-align: center; }
        .container { max-width: 1100px; margin: 20px auto; padding: 0 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .card { background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; }
        .thumb { aspect-ratio: 4/3; object-fit: cover; width: 100%; background:#eee; }
        .meta { padding: 12px 14px; font-size: 14px; color: #555; }
        .row { display:flex; justify-content: space-between; align-items:center; margin-top:6px; }
        .btns { display:flex; gap:8px; margin-top:10px; }
        .btn { text-decoration:none; padding:8px 10px; border-radius:8px; font-weight:600; font-size:13px; }
        .btn-view { background:#007bff; color:#fff; }
        .btn-open { background:#6c757d; color:#fff; }
    </style>
    <script>
        function copy(text){ navigator.clipboard.writeText(text).then(()=>alert('已复制链接')); }
        function humanSize(b){ if(b===0) return '0B'; const k=1024; const s=['B','KB','MB','GB']; const i=Math.floor(Math.log(b)/Math.log(k)); return (b/Math.pow(k,i)).toFixed(2)+' '+s[i]; }
    </script>
</head>
<body>
    <div class="topbar"><h2>🖼️ 批量查看（${images.length}）</h2></div>
    <div class="container">
        <div class="grid">
            ${images.map(img => `
                <div class="card">
                    <img class="thumb" src="${img.url}" alt="${img.title}">
                    <div class="meta">
                        <div><strong>${img.title}</strong></div>
                        <div class="row"><span>${img.filename}</span></div>
                        <div class="row"><span>${img.original_name}</span><span>${img.file_size? '' : ''}</span></div>
                        <div class="btns">
                            <a class="btn btn-view" href="/image/${img.id}">详情</a>
                            <a class="btn btn-open" href="${img.url}" target="_blank">打开原图</a>
                            <a class="btn" href="javascript:void(0)" onclick="copy('${img.url}')">复制直链</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="text-align:center; margin:20px 0;">
            <a href="/upload" class="btn btn-view" style="text-decoration:none;">继续上传</a>
        </div>
    </div>
</body>
</html>`;

        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    } catch (e) {
        console.error('Batch view error:', e);
        return new Response('Error loading images', { status: 500 });
    }
}
