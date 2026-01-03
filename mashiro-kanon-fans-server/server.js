const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 挂载路由模块
app.use('/api', apiRoutes);

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server is running on http://localhost:${PORT}`);
});