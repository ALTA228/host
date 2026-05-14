const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Підключення через змінні Render (це найнадійніше)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'vitalsync-db228-pohomov38-5ea8.h.aivencloud.com',
    port: process.env.DB_PORT || 14787,
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_v4I6Upq_vHI7EXoiut2',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: {
        rejectUnauthorized: false,
        connectTimeout: 20000
    },
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error('Помилка підключення:', err);
    } else {
        console.log('Підключено до хмарної бази VitalSync на Aiven');

        // Твоя логіка створення таблиць
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
            if (err) console.error('Помилка таблиць:', err);
            else console.log('Таблиці готові');
        });
    }
});

app.post('/api/register', (req, res) => {
    const { login, password } = req.body;
    db.query("SELECT * FROM users WHERE login = ?", [login], (err, results) => {
        if (err) {
            console.error('Помилка SELECT:', err);
            return res.status(500).json({ error: "DB Error" });
        }
        if (results.length > 0) {
            if (results[0].password === password) {
                return res.json({ success: true, userId: results[0].id });
            } else {
                return res.status(401).json({ error: "Wrong password" });
            }
        } else {
            db.query("INSERT INTO users (login, password) VALUES (?, ?)", [login, password], (err, result) => {
                if (err) {
                    console.error('Помилка INSERT:', err);
                    return res.status(500).json({ error: "Create error" });
                }
                res.json({ success: true, userId: result.insertId });
            });
        }
    });
});

// Додай ці маршрути, щоб працював дашборд зі скріншота image_aec798.png
app.get('/api/dashboard/:id', (req, res) => {
    const sql = `SELECT u.login, h.* FROM users u LEFT JOIN health_logs h ON u.id = h.user_id WHERE u.id = ? ORDER BY h.id DESC LIMIT 1`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0] || { login: "Not Found" });
    });
});

app.post('/api/update', (req, res) => {
    const { userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const sql = `INSERT INTO health_logs (user_id, weight, height, distance_km, sleep_hours, water_liters, calories_intake, kcal_target, date_recorded, bmi)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE weight=VALUES(weight), bmi=VALUES(bmi)`;
    db.query(sql, [userId, weight, height, steps, sleep, water, kcal, kcalTarget, today, bmi], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ status: "success" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));