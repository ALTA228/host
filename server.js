const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ÏÐßÌÅ Ï²ÄÊËÞ×ÅÍÍß (Ìàêñèìàëüíî ñóì³ñíå ç Render òà Aiven)
const db = mysql.createConnection({
    host: 'vitalsync-db228-pohomov38-5ea8.h.aivencloud.com',
    port: 14787,
    user: 'avnadmin',
    password: 'AVNS_v4I6Upq_vHI7EXoiut2',
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false // Öå äîçâîëèòü ï³äêëþ÷èòèñÿ áåç çàâàíòàæåííÿ ô³çè÷íîãî ôàéëó ñåðòèô³êàòà
    },
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error('ÊÐÈÒÈ×ÍÀ ÏÎÌÈËÊÀ Ï²ÄÊËÞ×ÅÍÍß:', err.message);
    } else {
        console.log('--- VitalSync Ï²ÄÊËÞ×ÅÍÎ ÄÎ AIVEN ---');

        const initSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            login VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            UNIQUE KEY (login)
        );
        CREATE TABLE IF NOT EXISTS health_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            weight FLOAT, height FLOAT, distance_km FLOAT,
            sleep_hours FLOAT, water_liters FLOAT,
            calories_intake INT, kcal_target INT,
            date_recorded DATE, bmi FLOAT,
            UNIQUE KEY (user_id, date_recorded),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`;

        db.query(initSql, (err) => {
            if (err) console.error('ÏÎÌÈËÊÀ ÑÒÂÎÐÅÍÍß ÒÀÁËÈÖÜ:', err.message);
            else console.log('Ñòðóêòóðà áàçè äàíèõ VitalSync ãîòîâà!');
        });
    }
});

// ÐÅªÑÒÐÀÖ²ß
app.post('/api/register', (req, res) => {
    const { login, password } = req.body;
    db.query("SELECT * FROM users WHERE login = ?", [login], (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error", details: err.message });
        if (results.length > 0) {
            if (results[0].password === password) {
                return res.json({ success: true, userId: results[0].id });
            } else {
                return res.status(401).json({ error: "Wrong password" });
            }
        } else {
            db.query("INSERT INTO users (login, password) VALUES (?, ?)", [login, password], (err, result) => {
                if (err) return res.status(500).json({ error: "Create error", details: err.message });
                res.json({ success: true, userId: result.insertId });
            });
        }
    });
});

// ÄÀØÁÎÐÄ
app.get('/api/dashboard/:id', (req, res) => {
    const sql = `
        SELECT u.login, h.* FROM users u 
        LEFT JOIN health_logs h ON u.id = h.user_id 
        WHERE u.id = ? 
        ORDER BY h.date_recorded DESC, h.id DESC 
        LIMIT 1`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results[0] || { login: "Not Found" });
    });
});

// ÎÍÎÂËÅÍÍß ÄÀÍÈÕ
app.post('/api/update', (req, res) => {
    const { userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const sql = `
        INSERT INTO health_logs (user_id, weight, height, distance_km, sleep_hours, water_liters, calories_intake, kcal_target, date_recorded, bmi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            weight=VALUES(weight), bmi=VALUES(bmi), distance_km=VALUES(distance_km), 
            sleep_hours=VALUES(sleep_hours), water_liters=VALUES(water_liters), 
            calories_intake=VALUES(calories_intake), kcal_target=VALUES(kcal_target)`;
    db.query(sql, [userId, weight, height, steps, sleep, water, kcal, kcalTarget, today, bmi], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));