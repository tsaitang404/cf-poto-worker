export async function handleStatic(request, env, path) {
  if (path === '/static/auth.html') {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - Poto图床</title>
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
        
        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 50px 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        
        .logo {
            font-size: 4em;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2em;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 16px;
        }
        
        .form-group { 
            margin-bottom: 25px;
            text-align: left;
        }
        
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: bold; 
            color: #555;
        }
        
        input[type="password"] { 
            width: 100%; 
            padding: 15px; 
            border: 2px solid #e1e5e9; 
            border-radius: 10px; 
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="password"]:focus {
            outline: none;
            border-color: #007bff;
        }
        
        button { 
            width: 100%;
            background: #007bff; 
            color: white; 
            padding: 15px; 
            border: none; 
            border-radius: 10px; 
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s;
        }
        
        button:hover { 
            background: #0056b3; 
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .tips {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            color: #6c757d;
            padding: 15px;
            border-radius: 8px;
            margin-top: 25px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🔐</div>
        <h1>登录验证</h1>
        <p class="subtitle">请输入上传密码以继续使用</p>
        
        <form method="POST" action="/login">
            <div class="form-group">
                <label>上传密码:</label>
                <input type="password" name="password" required autofocus>
            </div>
            
            <button type="submit">🚀 登录</button>
        </form>
        
        <div class="tips">
            💡 登录后24小时内无需重新输入密码
        </div>
    </div>
</body>
</html>`;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  if (path === '/static/upload.html') {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图片上传 - Poto图床</title>
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
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.2em;
        }
        
        .form-group { 
            margin-bottom: 20px; 
        }
        
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: bold; 
            color: #555;
        }
        
        input[type="password"], input[type="text"] { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e1e5e9; 
            border-radius: 8px; 
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="password"]:focus, input[type="text"]:focus {
            outline: none;
            border-color: #007bff;
        }
        
        .file-drop-area {
            position: relative;
            border: 3px dashed #ccc;
            border-radius: 15px;
            padding: 50px 20px;
            text-align: center;
            background: #fafafa;
            transition: all 0.3s ease;
            cursor: pointer;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .file-drop-area:hover, 
        .file-drop-area.dragover {
            border-color: #007bff;
            background: #f0f8ff;
            transform: translateY(-2px);
        }
        
        .file-drop-area.has-file {
            border-color: #28a745;
            background: #f8fff9;
        }
        
        .file-drop-area input[type="file"] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }
        
        .drop-message {
            color: #666;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .drop-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .file-info {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            display: none;
        }
        
        .file-info.show {
            display: block;
        }
        
        .preview-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .preview-image {
            max-width: 100%;
            max-height: 300px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        button { 
            width: 100%;
            background: #007bff; 
            color: white; 
            padding: 15px 24px; 
            border: none; 
            border-radius: 10px; 
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s;
        }
        
        button:hover { 
            background: #0056b3; 
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .message { 
            padding: 15px; 
            margin: 15px 0; 
            border-radius: 10px; 
            display: none;
        }
        
        .message.show {
            display: block;
        }
        
        .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb;
        }
        
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin: 10px 0;
        }
        
        .loading.show {
            display: block;
        }
        
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 50%;
            border-top-color: #007bff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .paste-hint {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            display: none;
        }
        
        .paste-hint.show {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .feature-tips {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h1 style="margin: 0;">📸 Poto 图床</h1>
            <a href="/logout" style="color: #dc3545; text-decoration: none; font-weight: bold;">🚪 退出登录</a>
        </div>
        
        <div class="feature-tips">
            💡 <strong>使用提示:</strong> 支持拖拽文件到虚线框内，或使用 Ctrl+V 粘贴剪贴板中的图片
        </div>
        
        <div id="message" class="message"></div>
        
        <form id="uploadForm">
            
            <div class="form-group">
                <label>图片标题:</label>
                <input type="text" name="title" id="title" placeholder="可选，留空将自动使用文件名">
            </div>
            
            <div class="form-group">
                <label>选择图片:</label>
                <div class="file-drop-area" id="dropArea">
                    <div class="drop-icon">📁</div>
                    <div class="drop-message">
                        点击选择文件或拖拽图片到这里<br>
                        <small>支持 JPG、PNG、GIF、WebP 格式，最大 10MB</small>
                    </div>
                    <input type="file" name="image" id="fileInput" accept="image/*" required>
                </div>
                <div class="file-info" id="fileInfo"></div>
            </div>
            
            <div class="preview-container" id="previewContainer"></div>
            
            <div class="loading" id="loading">
                <div class="loading-spinner"></div>
                <span>正在上传图片...</span>
            </div>
            
            <button type="submit" id="submitBtn">📤 上传图片</button>
        </form>
    </div>
    
    <div class="paste-hint" id="pasteHint">
        检测到剪贴板中有图片，按 Ctrl+V 粘贴
    </div>
    
    <script>
        const form = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        const dropArea = document.getElementById('dropArea');
        const previewContainer = document.getElementById('previewContainer');
        const titleInput = document.getElementById('title');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const message = document.getElementById('message');
        const fileInfo = document.getElementById('fileInfo');
        const pasteHint = document.getElementById('pasteHint');

        // 文件拖放处理
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        dropArea.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            dropArea.classList.add('dragover');
        }

        function unhighlight(e) {
            dropArea.classList.remove('dragover');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }

        // 文件选择处理
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // 粘贴图片处理
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    handleFile(file, true);
                    break;
                }
            }
        });

        // 检测剪贴板是否有图片
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'v') {
                pasteHint.classList.add('show');
                setTimeout(() => {
                    pasteHint.classList.remove('show');
                }, 2000);
            }
        });

        function handleFile(file, isPaste = false) {
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                showMessage('请选择图片文件', 'error');
                return;
            }

            // 验证文件大小 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showMessage('文件大小不能超过 10MB', 'error');
                return;
            }

            // 更新文件输入
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;

            // 显示文件信息
            showFileInfo(file, isPaste);

            // 自动填充标题
            if (!titleInput.value) {
                const fileName = file.name || 'pasted-image';
                const nameWithoutExt = fileName.replace(/\\.[^/.]+$/, '');
                titleInput.value = nameWithoutExt;
            }

            // 预览图片
            previewImage(file);
            
            // 更新拖拽区域样式
            dropArea.classList.add('has-file');
            dropArea.querySelector('.drop-message').innerHTML = 
                '✅ 已选择文件<br><small>可以重新拖拽或点击更换</small>';
        }

        function showFileInfo(file, isPaste) {
            const size = formatFileSize(file.size);
            const source = isPaste ? '📋 从剪贴板粘贴' : '📁 从本地选择';
            fileInfo.innerHTML = \`
                <strong>\${source}</strong><br>
                文件名: \${file.name || 'pasted-image.' + getExtensionFromMime(file.type)}<br>
                大小: \${size}<br>
                类型: \${file.type}
            \`;
            fileInfo.classList.add('show');
        }

        function previewImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContainer.innerHTML = \`
                    <img src="\${e.target.result}" alt="预览" class="preview-image">
                \`;
            };
            reader.readAsDataURL(file);
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function getExtensionFromMime(mimeType) {
            const mimeToExt = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp',
                'image/bmp': 'bmp'
            };
            return mimeToExt[mimeType] || 'png';
        }

        // 表单提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            setLoading(true);

            try {
                const formData = new FormData(form);
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    showMessage(\`
                        ✅ 上传成功！<br>
                        <strong>图片链接:</strong> <a href="\${result.url}" target="_blank">\${result.url}</a><br>
                        <strong>查看页面:</strong> <a href="\${result.viewUrl}" target="_blank">点击查看</a>
                    \`, 'success');
                    resetForm();
                } else {
                    showMessage('❌ 上传失败: ' + (result.message || '未知错误'), 'error');
                }
            } catch (error) {
                showMessage('❌ 上传失败: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        });

        function validateForm() {
            if (!fileInput.files || fileInput.files.length === 0) {
                showMessage('请选择图片文件', 'error');
                return false;
            }

            return true;
        }

        function setLoading(isLoading) {
            submitBtn.disabled = isLoading;
            if (isLoading) {
                loading.classList.add('show');
                submitBtn.textContent = '上传中...';
            } else {
                loading.classList.remove('show');
                submitBtn.textContent = '📤 上传图片';
            }
        }

        function showMessage(text, type) {
            message.className = \`message \${type} show\`;
            message.innerHTML = text;
            
            // 自动隐藏成功消息
            if (type === 'success') {
                setTimeout(() => {
                    message.classList.remove('show');
                }, 8000);
            }
        }

        function resetForm() {
            form.reset();
            previewContainer.innerHTML = '';
            fileInfo.classList.remove('show');
            dropArea.classList.remove('has-file');
            dropArea.querySelector('.drop-message').innerHTML = 
                '点击选择文件或拖拽图片到这里<br><small>支持 JPG、PNG、GIF、WebP 格式，最大 10MB</small>';
        }
    </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  if (path === '/static/auth.html') {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>身份验证</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 300px; margin: 100px auto; padding: 20px; text-align: center; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .error { color: red; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>🔐 身份验证</h1>
    <p>请输入访问密码</p>
    <form id="authForm">
        <input type="password" name="password" placeholder="密码" required autofocus>
        <br>
        <button type="submit">🚀 验证</button>
    </form>
    <div id="error" class="error"></div>
    <script>
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const error = document.getElementById('error');
            
            try {
                const response = await fetch('/auth', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = result.redirectUrl || '/upload';
                } else {
                    error.textContent = result.message || '密码错误';
                }
            } catch (err) {
                error.textContent = '验证失败: ' + err.message;
            }
        });
    </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  return new Response('File not found', { status: 404 });
}
