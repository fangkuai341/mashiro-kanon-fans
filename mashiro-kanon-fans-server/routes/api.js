const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const kanonController = require('../controllers/kanonController');

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// 文件过滤器：只允许图片
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
    }
};

// 配置 multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
    },
    fileFilter: fileFilter
});

// 动态路由
router.get('/news', kanonController.getNews);
router.post('/news', kanonController.createNews);
router.put('/news/:id', kanonController.updateNews);
router.delete('/news/:id', kanonController.deleteNews);

// 语录路由
router.get('/quotes', kanonController.getQuotes);
router.get('/allQuotes', kanonController.getAllQuotes);
router.post('/quotes', kanonController.createQuote);
router.put('/quotes/:id', kanonController.updateQuote);
router.delete('/quotes/:id', kanonController.deleteQuote);

// 时间轴路由
router.get('/timeline', kanonController.getTimeline);
router.post('/timeline', kanonController.createTimeline);
router.put('/timeline/:id', kanonController.updateTimeline);
router.delete('/timeline/:id', kanonController.deleteTimeline);

// 歌曲路由
router.get('/songs', kanonController.getSongs);
router.get('/songs/artist-preferences', kanonController.getArtistPreferences);
router.post('/songs', kanonController.createSong);
router.put('/songs/:id', kanonController.updateSong);
router.delete('/songs/:id', kanonController.deleteSong);

// 同人图路由
router.get('/fanarts', kanonController.getFanarts);
router.post('/fanarts', kanonController.createFanart);
router.delete('/fanarts/:id', kanonController.deleteFanart);


// 第三方数据路由
router.get('/bilibili/stats', kanonController.getBiliStats);
router.get('/bilibili/archives', kanonController.getBiliSeriesArchives);
//商店路由
router.get('/shop', kanonController.getShop);

// 图片上传路由
router.post('/upload/image', upload.single('image'), kanonController.uploadImage);

module.exports = router;