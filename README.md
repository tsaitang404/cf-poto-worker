# Cloudflare Workers 图床

基于 Cloudflare Workers、R2 存储和 D1 数据库的现代化图床服务。

## ✨ 特性

- 🚀 **无服务器架构** - 基于 Cloudflare Workers，全球边缘部署
- 📦 **R2 存储** - 低成本、高性能的对象存储
- 🗄️ **D1 数据库** - SQLite 兼容的无服务器数据库
- 🖼️ **WebP 转换** - 自动将上传的图片转换为 WebP 格式以节省带宽
- 🔐 **密码保护** - 简单有效的上传密码验证
- 📱 **响应式设计** - 支持桌面和移动设备
- 🖱️ **拖拽上传** - 支持拖拽文件和粘贴图片
- 📋 **一键复制** - 快速复制图片链接

## 🛠️ 技术栈

- **运行时**: Cloudflare Workers
- **存储**: Cloudflare R2
- **数据库**: Cloudflare D1  
- **前端**: 原生 HTML/CSS/JavaScript
- **部署**: Wrangler CLI

## 🚀 快速开始

### 1. 环境准备

确保你已经安装了 Node.js 和 npm，然后安装 Wrangler CLI：

\`\`\`bash
npm install -g wrangler
\`\`\`

登录到你的 Cloudflare 账户：

\`\`\`bash
wrangler login
\`\`\`

### 2. 创建 Cloudflare 资源

#### 创建 R2 存储桶
\`\`\`bash
wrangler r2 bucket create your-images-bucket
\`\`\`

#### 创建 D1 数据库
\`\`\`bash
npm run db:create
\`\`\`

### 3. 配置项目

1. 克隆或下载项目代码
2. 编辑 \`wrangler.toml\` 文件，更新以下配置：

\`\`\`toml
[vars]
UPLOAD_PASSWORD = "your_secure_password_here"

[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "your-images-bucket"  # 替换为你的存储桶名称

[[d1_databases]]
binding = "DB"
database_name = "poto-db"
database_id = "your-database-id"    # 替换为你的数据库ID
\`\`\`

### 4. 初始化数据库

\`\`\`bash
# 本地开发环境
npm run db:migrate:local

# 生产环境
npm run db:migrate
\`\`\`

### 5. 本地开发

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:8787 查看应用。

### 6. 部署到生产环境

\`\`\`bash
npm run deploy
\`\`\`

## 📝 使用说明

1. 访问部署后的 Worker URL
2. 输入上传密码（在 \`wrangler.toml\` 中配置的 \`UPLOAD_PASSWORD\`）
3. 选择或拖拽图片文件
4. 填写图片标题（可选）
5. 点击上传按钮
6. 上传成功后会自动跳转到图片查看页面
7. 点击复制按钮可以快速复制图片链接

## 🔧 配置选项

### 环境变量

在 \`wrangler.toml\` 的 \`[vars]\` 部分配置：

- \`UPLOAD_PASSWORD\`: 上传密码，用于验证上传权限
- \`R2_PUBLIC_URL\`: R2 存储桶的公共访问 URL（可选，用于自定义域名）

### R2 存储桶绑定

\`\`\`toml
[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "your-bucket-name"
\`\`\`

### D1 数据库绑定

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "your-db-name"
database_id = "your-db-id"
\`\`\`

## 🗄️ 数据库结构

### images 表
存储上传的图片信息：

\`\`\`sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL
);
\`\`\`

### configurations 表
存储系统配置：

\`\`\`sql
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_password TEXT NOT NULL,
    r2_public_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔒 安全考虑

1. **密码保护**: 使用强密码作为上传密码
2. **文件类型验证**: 只允许上传图片文件
3. **文件大小限制**: 默认限制为 10MB
4. **CORS 配置**: 合理配置跨域访问策略

## 📈 性能优化

1. **WebP 转换**: 自动转换为 WebP 格式以减小文件体积
2. **边缘缓存**: 利用 Cloudflare 的全球 CDN 网络
3. **压缩优化**: 图片压缩以节省带宽和存储成本

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
