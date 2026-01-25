const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');

const app = express();

// 创建 uploads 目录（如果不存在）
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件配置
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供上传的图片访问
app.use('/uploads', express.static(uploadsDir));

// 挂载路由模块
app.use('/api', apiRoutes);
// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server is running on http://localhost:${PORT}`);
});