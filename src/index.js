import { handleUpload } from './handlers/upload.js';
import { handleView } from './handlers/view.js';
import { handleAuth, validateSession } from './handlers/auth.js';
import { handleStatic } from './handlers/static-new.js';
import { corsHeaders } from './utils/cors.js';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // 处理请求
      const response = await handleRequest(request, env, ctx, path);
      
      // 创建新的响应以添加CORS头（避免修改不可变头部）
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...corsHeaders
        }
      });
      
      return newResponse;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error: ' + error.message, { 
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

async function handleRequest(request, env, ctx, path) {
  // 静态文件处理（不需要认证）
  if (path.startsWith('/static/')) {
    return handleStatic(request, env, path);
  }
  
  // 登录页面（不需要认证）
  if (path === '/login' && request.method === 'GET') {
    return handleStatic(request, env, '/static/auth.html');
  }
  
  // 处理登录验证（不需要认证）
  if (path === '/login' && request.method === 'POST') {
    return handleAuth(request, env);
  }
  
  // 查看图片（不需要认证）
  if (path.startsWith('/image/')) {
    const imageId = path.split('/')[2];
    return handleView(request, env, imageId);
  }
  
  // API: 获取图片信息（不需要认证）
  if (path.startsWith('/api/image/')) {
    const imageId = path.split('/')[3];
    return getImageInfo(env, imageId);
  }
  
  // 注销操作
  if (path === '/logout') {
    const loginUrl = new URL('/login', request.url);
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': loginUrl.toString(),
        'Set-Cookie': 'session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'
      }
    });
    return response;
  }
  
  // 检查会话认证（需要登录的页面）
  const isAuthenticated = validateSession(request);
  
  // 根路径 - 重定向到上传页面（如果已认证）或登录页面
  if (path === '/') {
    const targetUrl = isAuthenticated ? 
      new URL('/upload', request.url) : 
      new URL('/login', request.url);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl.toString()
      }
    });
  }
  
  // 上传页面 - 需要认证
  if (path === '/upload' && request.method === 'GET') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': loginUrl.toString()
        }
      });
    }
    return handleStatic(request, env, '/static/upload.html');
  }
  
  // 处理图片上传 - 需要认证
  if (path === '/upload' && request.method === 'POST') {
    if (!isAuthenticated) {
      return Response.json({ success: false, message: '请先登录' }, { status: 401 });
    }
    return handleUpload(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function getImageInfo(env, imageId) {
  try {
    const stmt = env.DB.prepare('SELECT * FROM images WHERE id = ?');
    const result = await stmt.bind(imageId).first();
    
    if (!result) {
      return new Response('Image not found', { status: 404 });
    }
    
    return Response.json(result);
  } catch (error) {
    console.error('Error getting image info:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
