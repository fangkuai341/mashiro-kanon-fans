const pool = require('../config/db');
const axios = require('axios');
const schedule = require('node-schedule');
// --- 1. 动态 News (CRUD) ---
exports.getNews = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news ORDER BY id ASC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createNews = async (req, res) => {
    const { cat, date, text } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO news (cat, date, text) VALUES (?, ?, ?)', [cat, date, text]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateNews = async (req, res) => {
    const { cat, date, text } = req.body;
    try {
        await pool.query('UPDATE news SET cat = ?, date = ?, text = ? WHERE id = ?', [cat, date, text, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteNews = async (req, res) => {
    try {
        await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 2. 语录 Quotes (CRUD) ---
exports.getQuotes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM quotes ORDER BY RAND() LIMIT 1');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createQuote = async (req, res) => {
    const { text } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO quotes (text) VALUES (?)', [text]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateQuote = async (req, res) => {
    const { text } = req.body;
    try {
        await pool.query('UPDATE quotes SET text = ? WHERE id = ?', [text, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteQuote = async (req, res) => {
    try {
        await pool.query('DELETE FROM quotes WHERE id = ?', [req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 3. 时间轴 Timeline (CRUD) ---
exports.getTimeline = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM timeline ORDER BY year DESC, date ASC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createTimeline = async (req, res) => {
    const { year, date, text, remark } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO timeline (year, date, text, remark) VALUES (?, ?, ?, ?)', [year, date, text, remark]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateTimeline = async (req, res) => {
    const { year, date, text, remark } = req.body;
    try {
        await pool.query('UPDATE timeline SET year = ?, date = ?, text = ?, remark = ? WHERE id = ?', [year, date, text, remark, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteTimeline = async (req, res) => {
    try {
        await pool.query('DELETE FROM timeline WHERE id = ?', [req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 4. 歌曲 Songs (CRUD + Search) ---
exports.getSongs = async (req, res) => {
    try {
        let sql = 'SELECT * FROM songs';
        let params = [];
        if (req.query.q) {
            sql += ' WHERE title LIKE ? OR artist LIKE ? OR chinese_name LIKE ?';
            const term = `%${req.query.q}%`;
            params = [term, term, term];
        }
        const [rows] = await pool.query(sql + ' ORDER BY last_song DESC', params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createSong = async (req, res) => {
    const { title, artist, last_sung, link } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO songs (title, artist, last_sung, link) VALUES (?, ?, ?, ?)', [title, artist, last_sung, link]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateSong = async (req, res) => {
    const { title, artist, last_sung, link } = req.body;
    try {
        await pool.query('UPDATE songs SET title = ?, artist = ?, last_sung = ?, link = ? WHERE id = ?', [title, artist, last_sung, link, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 注：根据表格设计，歌曲不开放删除功能（保留记录）

/** 获取前 30 天常驻歌手偏好：按 '/' 拆分 artist，统计每位歌手的演唱次数 */
exports.getArtistPreferences = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT artist, last_song FROM songs WHERE artist IS NOT NULL AND artist != ""');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const countByArtist = {};
        for (const row of rows) {
            const raw = row.last_song;
            if (raw == null || raw === '') continue;
            const d = new Date(raw);
            if (isNaN(d.getTime()) || d < thirtyDaysAgo) continue;
            const artists = (row.artist || '')
                .split('/')
                .map((s) => s.trim())
                .filter(Boolean);
            for (const name of artists) {
                countByArtist[name] = (countByArtist[name] || 0) + 1;
            }
        }
        const result = Object.entries(countByArtist)
            .map(([artist, count]) => ({ artist, count }))
            .sort((a, b) => b.count - a.count).slice(0, 5);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- 5. 直播日程 Schedule (CRUD + Search) ---
exports.getSchedule = async (req, res) => {
    try {
        const { year, month} = req.query;
        let sql = 'SELECT * FROM schedule';
        let conditions = [];
        let params = [];

        // 根据年份筛选
        if (year) {
            conditions.push('YEAR(date) = ?');
            params.push(year);
        }

        // 根据月份筛选
        if (month) {
            conditions.push('MONTH(date) = ?');
            params.push(month);
        }

       

        // 如果有条件，添加 WHERE 子句
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY date ASC';

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createSchedule = async (req, res) => {
    const { type, time, text } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO schedule (type, time, text) VALUES (?, ?, ?)', [type, time, text]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateSchedule = async (req, res) => {
    const { type, time, text } = req.body;
    try {
        await pool.query('UPDATE schedule SET type = ?, time = ?, text = ? WHERE id = ?', [type, time, text, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteSchedule = async (req, res) => {
    try {
        await pool.query('DELETE FROM schedule WHERE id = ?', [req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 6. 同人图 Fanart (CRUD) ---
exports.getFanarts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM fanarts ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createFanart = async (req, res) => {
    const { author, title, img_url, source_link } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO fanarts (author, title, img_url, source_link) VALUES (?, ?, ?, ?)', [author, title, img_url, source_link]);
        res.json({ id: result.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateFanart = async (req, res) => {
    const { author, title, img_url, source_link } = req.body;
    try {
        await pool.query('UPDATE fanarts SET author = ?, title = ?, img_url = ?, source_link = ? WHERE id = ?', [author, title, img_url, source_link, req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteFanart = async (req, res) => {
    try {
        await pool.query('DELETE FROM fanarts WHERE id = ?', [req.params.id]);
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 2. 封装获取 B站数据的函数 (公用) ---
async function fetchBiliData() {
    const targetUrl = `https://api.bilibili.com/x/relation/stat?vmid=401480763`;
    const response = await axios.get(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com/'
        }
    });
    return response.data; // 返回整个响应体
}

// --- 3. 封装保存到数据库的函数 ---
async function saveToDatabase(followerCount) {
    try {
        // SQL 插入语句: 记录 mid, follower, 和当前时间 (NOW())
        const sql = 'INSERT INTO stats_records (follower, record_time) VALUES ( ?, NOW())';
        const [result] = await pool.execute(sql, [followerCount]);
        console.log(`[数据库] 数据已保存! ID: ${result.insertId}, 粉丝数: ${followerCount}`);
    } catch (err) {
        console.error('[数据库] 保存失败:', err.message);
    }
}

// --- 4. 定时任务: 每天 00:01 执行 ---
// Cron 格式: 秒 分 时 日 月 周
const job = schedule.scheduleJob('0 1 0 * * *', async function(){
    console.log(`[定时任务] 开始执行: ${new Date().toLocaleString()}`);
    try {
        // 1. 获取数据
        const resData = await fetchBiliData();
        
        if (resData.code === 0 && resData.data) {
            const follower = resData.data.follower;
            // 2. 存入数据库
            await saveToDatabase(follower);
        } else {
            console.error('[定时任务] B站接口返回异常:', resData);
        }
    } catch (error) {
        console.error('[定时任务] 执行出错:', error.message);
    }
});

// --- 7. Bilibili 粉丝数据  
exports.getBiliStats =async (req, res) => {
    
    try {
        const [rows] = await pool.query('SELECT * FROM stats_records ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
}

// --- 9. Bilibili 系列稿件列表 (透传第三方接口) ---
exports.getBiliSeriesArchives = async (req, res) => {
    const {
        mid = '401480763',
        current_mid = '293942714',
        series_id = '210517',
        ps = '3',
        pn = '1',
    } = req.query;

    try {
        const response = await axios.get('https://api.bilibili.com/x/series/archives', {
            params: { mid, current_mid, series_id, ps, pn },
            timeout: 8000,
        });

        res.json(response.data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch Bilibili series archives', detail: e.message });
    }
};
// --- 8. 商店 Shop (CRUD) ---
exports.getShop = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shopp ');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
}

// --- 10. 图片上传 Upload Image ---
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        // 返回图片的访问URL
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ 
            success: true,
            url: imageUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}