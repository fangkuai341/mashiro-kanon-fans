const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const kanonController = require('../controllers/kanonController');

// 配置 multer 存储 - 图片
const imageStorage = multer.diskStorage({
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

// 配置 multer 存储 - 音乐
const musicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：原始文件名 + 时间戳 + 扩展名
        const timestamp = Date.now();
        // 正确处理中文文件名：从 latin1 转换为 utf8
        let originalName = file.originalname;
        try {
            // 如果文件名包含中文字符，可能需要从 latin1 解码
            originalName = Buffer.from(originalName, 'latin1').toString('utf8');
        } catch (e) {
            // 如果转换失败，使用原始文件名
            originalName = file.originalname;
        }
        const ext = path.extname(originalName);
        // 获取原始文件名（不含扩展名）
        let basename = originalName.substring(0, originalName.length - ext.length);
        // 清理文件名中的特殊字符，但保留中文
        basename = basename.replace(/[<>:"/\\|?*]/g, '_');
        // 组合最终文件名
        const finalName = basename + '-' + timestamp + ext;
        cb(null, finalName);
    }
});

// 文件过滤器：只允许图片
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
    }
};

// 文件过滤器：只允许音乐文件
const musicFileFilter = (req, file, cb) => {
    const allowedTypes = /mp3|wav|flac|aac|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /audio/.test(file.mimetype);

    if ((mimetype || extname) && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传音乐文件 (mp3, wav, flac, aac, ogg, m4a)'));
    }
};

// 配置 multer - 图片上传
const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
    },
    fileFilter: imageFileFilter
});

// 配置 multer - 音乐上传
const uploadMusic = multer({
    storage: musicStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
    },
    fileFilter: musicFileFilter
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
router.post('/upload/image', uploadImage.single('image'), kanonController.uploadImage);

// 音乐上传路由
router.post('/upload/music', uploadMusic.single('music'), kanonController.uploadMusic);

// 反馈路由
router.get('/feedbacks', kanonController.getFeedbacks);
router.post('/feedbacks', kanonController.createFeedback);
router.delete('/feedbacks/:id', kanonController.deleteFeedback);

module.exports = router;