#!/bin/bash

# Cloudflare Workers 图床部署脚本

set -e

echo "🚀 开始部署 Cloudflare Workers 图床..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 wrangler CLI，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ 未登录 Cloudflare，请先登录："
    echo "wrangler login"
    exit 1
fi

echo "✅ Cloudflare 登录状态正常"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 创建 R2 存储桶（如果不存在）
echo "🗃️ 检查 R2 存储桶..."
BUCKET_NAME=$(grep -A 2 "\[\[r2_buckets\]\]" wrangler.toml | grep "bucket_name" | cut -d'"' -f2)
if [ -n "$BUCKET_NAME" ]; then
    if ! wrangler r2 bucket list | grep -q "$BUCKET_NAME"; then
        echo "📦 创建 R2 存储桶: $BUCKET_NAME"
        wrangler r2 bucket create "$BUCKET_NAME"
    else
        echo "✅ R2 存储桶已存在: $BUCKET_NAME"
    fi
fi

# 创建 D1 数据库（如果不存在）
echo "🗄️ 检查 D1 数据库..."
DB_NAME=$(grep -A 3 "\[\[d1_databases\]\]" wrangler.toml | grep "database_name" | cut -d'"' -f2)
if [ -n "$DB_NAME" ]; then
    if ! wrangler d1 list | grep -q "$DB_NAME"; then
        echo "📊 创建 D1 数据库: $DB_NAME"
        wrangler d1 create "$DB_NAME"
        echo "⚠️  请手动更新 wrangler.toml 中的 database_id"
    else
        echo "✅ D1 数据库已存在: $DB_NAME"
    fi
fi

# 初始化数据库表结构
echo "🏗️ 初始化数据库表结构..."
if [ -f "schema.sql" ]; then
    wrangler d1 execute "$DB_NAME" --file=./schema.sql
    echo "✅ 数据库表结构初始化完成"
fi

# 部署 Worker
echo "🚀 部署 Worker..."
wrangler deploy

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 如果是首次部署，请检查并更新 wrangler.toml 中的配置"
echo "2. 确保设置了正确的 UPLOAD_PASSWORD"
echo "3. 如果使用自定义域名，请设置 R2_PUBLIC_URL 环境变量"
echo "4. 访问你的 Worker URL 开始使用图床服务"
echo ""
