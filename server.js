const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config(); // Підключаємо dotenv для роботи з файлом .env або Render

const app = express();

app.use(cors());
app.use(express.json());

// Налаштування підключення (використовуємо змінні з Render)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-vitalsync-db228-vitalsync-db228.l.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'ТВОЙ_ПАРОЛЬ_ОТ_AIVEN',
    port: process.env.DB_PORT || 11475,
    database: process.env.DB_NAME || 'VitalSync_Project',
    ssl: {
        rejectUnauthorized: false
    },
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('Помилка підключення до MySQL:', err);
    } else {
        console.log(`Підключено до бази: ${process.env.DB_NAME || 'VitalSync_Project'} (SQL Ready)`);
    }
});

// РЕЄСТРАЦІЯ / ЛОГІН
app.post('/api/register', (req, res) => {
    const { login, password } = req.body;
    db.query("SELECT * FROM Users WHERE login = ?", [login], (err, results) => {
        if (err) return res.status(500).json({ error: "Помилка бази даних" });

        if (results.length > 0) {
            if (results[0].password === password) {
                return res.json({ success: true, userId: results[0].id });
            } else {
                return res.status(401).json({ error: "Невірний пароль" });
            }
        } else {
            db.query("INSERT INTO Users (login, password) VALUES (?, ?)", [login, password], (err, result) => {
                if (err) return res.status(500).json({ error: "Помилка створення юзера" });
                res.json({ success: true, userId: result.insertId });
            });
        }
    });
});

// ДАНІ ДЛЯ ДАШБОРДУ
app.get('/api/dashboard/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT u.login, h.* FROM Users u
        LEFT JOIN health_logs h ON u.id = h.user_id
        WHERE u.id = ?
        ORDER BY h.log_id DESC LIMIT 1`; // Використовуємо log_id, як у твоїй таблиці

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({ login: "User Not Found" });
        }
    });
});

// ОНОВЛЕННЯ ПОКАЗНИКІВ
app.post('/api/update', (req, res) => {
    const { userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi } = req.body;

    // SQL запит для запису нових даних
    const sql = `
        INSERT INTO health_logs (user_id, weight, height, distance_km, sleep_hours, water_liters, calories_intake, kcal_target, bmi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi], (err, result) => {
        if (err) {
            console.error('SQL Update Error:', err);
            return res.status(500).json(err);
        }
        res.json({ status: "success", message: "Дані збережено у VitalSync_Project" });
    });
});

// ІСТОРІЯ
app.get('/api/history/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM health_logs WHERE user_id = ? ORDER BY log_id DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер VitalSync працює на порту ${PORT}`));