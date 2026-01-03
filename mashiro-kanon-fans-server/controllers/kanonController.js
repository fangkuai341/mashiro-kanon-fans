const pool = require('../config/db');
// --- 1. 动态 News (CRUD) ---
exports.getNews = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news ORDER BY id DESC');
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
        const [rows] = await pool.query('SELECT * FROM quotes ORDER BY id DESC');
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
        const [rows] = await pool.query('SELECT * FROM timeline ORDER BY year DESC, date DESC');
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
            sql += ' WHERE title LIKE ? OR artist LIKE ?';
            const term = `%${req.query.q}%`;
            params = [term, term];
        }
        const [rows] = await pool.query(sql + ' ORDER BY last_sung DESC', params);
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

// --- 5. 直播日程 Schedule (CRUD + Search) ---
exports.getSchedule = async (req, res) => {
    try {
        let sql = 'SELECT * FROM schedule';
        let params = [];
        if (req.query.q) {
            sql += ' WHERE text LIKE ? OR type LIKE ?';
            const term = `%${req.query.q}%`;
            params = [term, term];
        }
        const [rows] = await pool.query(sql + ' ORDER BY time ASC', params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
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

// --- 7. Bilibili 模拟数据 ---
exports.getBiliStats = (req, res) => {
    res.json({
        followerCount: 152300,
        milestones: [
            { count: 100000, date: '2023-05-10' },
            { count: 150000, date: '2024-01-20' }
        ]
    });
};