const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Використовуємо змінні з Render Environment або твої дані як дефолт
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
        console.error('Помилка підключення до MySQL:', err);
    } else {
        console.log('Підключено до хмарної бази VitalSync на Aiven');

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

// Додаємо порт від Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер працює на порту ${PORT}`));