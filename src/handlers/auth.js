export async function handleAuth(request, env) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const formData = await request.formData();
    const password = formData.get('password');

    // 验证密码
    if (password === env.UPLOAD_PASSWORD) {
      // 创建会话token
      const sessionData = { 
        authenticated: true, 
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24小时
      };
      const sessionToken = btoa(JSON.stringify(sessionData));

      // 设置Cookie并重定向
      const redirectUrl = new URL('/upload', request.url);
      const response = new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl.toString(),
          'Set-Cookie': `session=${sessionToken}; Path=/; Max-Age=${24 * 60 * 60}; HttpOnly; Secure; SameSite=Strict`
        }
      });
      
      return response;
    } else {
      // 返回错误页面
      return new Response(getErrorPage('密码错误，请重试'), { 
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(getErrorPage('认证失败'), { 
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

function getErrorPage(message) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>登录失败</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 400px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
    </style>
</head>
<body>
    <h1>❌ ${message}</h1>
    <div class="error">请检查密码是否正确</div>
    <a href="/login" class="btn">返回登录</a>
</body>
</html>`;
}

export function validateSession(request) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return false;
    }

    // 解析Cookie
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });

    const sessionToken = cookies.session;
    if (!sessionToken) {
      return false;
    }

    // 解码并验证会话
    const sessionData = JSON.parse(atob(sessionToken));
    const now = Date.now();
    
    return sessionData.authenticated && 
           sessionData.expires > now;
  } catch (error) {
    return false;
  }
}
