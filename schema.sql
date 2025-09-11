-- 创建图片信息表
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL
);

-- 创建配置表 
CREATE TABLE IF NOT EXISTS configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_password TEXT NOT NULL,
    r2_public_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT OR IGNORE INTO configurations (id, upload_password, r2_public_url) 
VALUES (1, 'change_this_password', 'https://your-r2-domain.com');
