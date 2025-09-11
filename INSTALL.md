# 快速安装指南

## 1. 环境准备

### 安装 Node.js 和 npm
确保你的系统已安装 Node.js (版本 16 或更高)：
```bash
node --version
npm --version
```

### 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 登录 Cloudflare
```bash
wrangler login
```

## 2. 项目配置

### 克隆项目
```bash
git clone <your-repo-url>
cd cf-poto-worker
```

### 安装依赖
```bash
npm install
```

### 创建环境变量文件
```bash
cp .dev.vars.example .dev.vars
```
编辑 `.dev.vars` 文件，设置你的上传密码。

## 3. Cloudflare 资源配置

### 创建 R2 存储桶
```bash
wrangler r2 bucket create my-images-bucket
```

### 创建 D1 数据库
```bash
wrangler d1 create poto-db
```

执行后会返回数据库 ID，复制这个 ID。

### 更新 wrangler.toml
编辑 `wrangler.toml` 文件，更新以下内容：

```toml
name = "your-worker-name"  # 你的 Worker 名称

[vars]
UPLOAD_PASSWORD = "your_secure_password"  # 你的上传密码

[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "my-images-bucket"  # 你创建的存储桶名称

[[d1_databases]]
binding = "DB"
database_name = "poto-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 你的数据库 ID
```

### 初始化数据库
```bash
# 本地开发环境
npm run db:migrate:local

# 生产环境  
npm run db:migrate
```

## 4. 本地开发

启动本地开发服务器：
```bash
npm run dev
```

访问 http://localhost:8787 测试应用。

## 5. 部署到生产环境

### 方法一：使用部署脚本（推荐）
```bash
./deploy.sh
```

### 方法二：手动部署
```bash
npm run deploy
```

## 6. 配置自定义域名（可选）

### 配置 R2 自定义域名
1. 在 Cloudflare Dashboard 中进入 R2
2. 选择你的存储桶
3. 在 Settings 选项卡中配置 Custom Domain
4. 更新 `wrangler.toml` 中的 `R2_PUBLIC_URL` 变量

### 配置 Worker 自定义域名
1. 在 Cloudflare Dashboard 中进入 Workers & Pages
2. 选择你的 Worker
3. 在 Settings 选项卡中添加 Custom Domain

## 7. 安全建议

1. **强密码**: 使用复杂的上传密码
2. **域名限制**: 考虑在 Worker 中添加域名白名单
3. **访问日志**: 启用 Cloudflare 的安全功能
4. **定期更新**: 保持依赖和配置的最新状态

## 8. 常见问题

### 问题：数据库连接失败
- 检查 `database_id` 是否正确
- 确认数据库已创建并初始化

### 问题：图片上传失败
- 检查 R2 存储桶权限
- 验证文件大小和格式限制
- 查看 Worker 日志错误信息

### 问题：无法访问图片
- 检查 R2 存储桶的公共访问设置
- 验证 `R2_PUBLIC_URL` 配置

## 9. 进一步优化

1. **图片压缩**: 集成专业的图片处理服务
2. **缓存策略**: 配置适当的缓存头
3. **监控告警**: 设置 Cloudflare Analytics 和告警
4. **备份策略**: 定期备份数据库和重要配置

## 10. 技术支持

遇到问题可以：
1. 查看项目 README 文档
2. 检查 Cloudflare 官方文档
3. 提交 GitHub Issue（如果有的话）
