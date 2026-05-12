const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ПІДКЛЮЧЕННЯ ДО БАЗИ (AIVEN CLOUD)
const db = mysql.createConnection({
    host: 'mysql-3243f173-pakhomov-v-v-3031.l.aivencloud.com',
    port: 28834,
    user: 'avnadmin',
    password: 'AVNS_v4I6Upq_vHI7EXoiut2', // Пароль підставлено
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    },
    multipleStatements: true // Дозволяє виконувати кілька запитів одночасно (потрібно для ініціалізації)
});

db.connect(err => {
    if (err) {
        console.error('Помилка підключення до MySQL:', err);
    } else {
        console.log('Підключено до хмарної бази VitalSync на Aiven');

        // АВТОМАТИЧНЕ СТВОРЕННЯ ТАБЛИЦЬ ПРИ ЗАПУСКУ
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
            weight FLOAT,
            height FLOAT,
            distance_km FLOAT,
            sleep_hours FLOAT,
            water_liters FLOAT,
            calories_intake INT,
            kcal_target INT,
            date_recorded DATE,
            bmi FLOAT,
            UNIQUE KEY (user_id, date_recorded),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`;

        db.query(initSql, (err) => {
            if (err) console.error('Помилка створення таблиць:', err);
            else console.log('Таблиці перевірено/створено успішно');
        });
    }
});

// РЕЄСТРАЦІЯ ТА ВХІД
app.post('/api/register', (req, res) => {
    const { login, password } = req.body;
    db.query("SELECT * FROM users WHERE login = ?", [login], (err, results) => {
        if (err) return res.status(500).json({ error: "Помилка бази даних" });

        if (results.length > 0) {
            if (results[0].password === password) {
                return res.json({ success: true, userId: results[0].id });
            } else {
                return res.status(401).json({ error: "Невірний пароль" });
            }
        } else {
            db.query("INSERT INTO users (login, password) VALUES (?, ?)", [login, password], (err, result) => {
                if (err) return res.status(500).json({ error: "Помилка створення юзера" });
                res.json({ success: true, userId: result.insertId });
            });
        }
    });
});

// ОТРИМАННЯ ДАНИХ ДЛЯ ПРОФІЛЮ
app.get('/api/dashboard/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT u.login, h.* FROM users u
        LEFT JOIN health_logs h ON u.id = h.user_id
        WHERE u.id = ?
        ORDER BY h.id DESC LIMIT 1`;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({ login: "User Not Found" });
        }
    });
});

// ОНОВЛЕННЯ БІОМЕТРІЇ
app.post('/api/update', (req, res) => {
    const { userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const sql = `
        INSERT INTO health_logs (user_id, weight, height, distance_km, sleep_hours, water_liters, calories_intake, kcal_target, date_recorded, bmi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            weight = VALUES(weight),
            height = VALUES(height),
            distance_km = VALUES(distance_km),
            sleep_hours = VALUES(sleep_hours),
            water_liters = VALUES(water_liters),
            calories_intake = VALUES(calories_intake),
            kcal_target = VALUES(kcal_target),
            bmi = VALUES(bmi);
    `;

    db.query(sql, [userId, weight, height, steps, sleep, water, kcal, kcalTarget, today, bmi], (err, result) => {
        if (err) {
            console.error('SQL Update Error:', err);
            return res.status(500).json(err);
        }
        res.json({ status: "success", message: "Data updated for today" });
    });
});

// ІСТОРІЯ ЛОГІВ
app.get('/api/history/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM health_logs WHERE user_id = ? ORDER BY date_recorded DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// ЗАПУСК СЕРВЕРА
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер VitalSync працює на порту ${PORT}`));