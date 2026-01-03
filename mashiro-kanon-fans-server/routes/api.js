const express = require('express');
const router = express.Router();
const kanonController = require('../controllers/kanonController');

// 动态路由
router.get('/news', kanonController.getNews);
router.post('/news', kanonController.createNews);

// 语录路由
router.get('/quotes', kanonController.getQuotes);

// 歌曲路由
router.get('/songs', kanonController.getSongs);

// 日程路由
router.get('/schedule', kanonController.getSchedule);

// 第三方数据路由
router.get('/bilibili/stats', kanonController.getBiliStats);

module.exports = router;