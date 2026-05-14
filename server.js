const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Налаштування підключення до Aiven
const dbConfig = {
    host: 'vitalsync-db228-pohomov38-5ea8.h.aivencloud.com',
    port: 14787,
    user: 'avnadmin',
    password: 'AVNS_v4I6Upq_vHI7EXoiut2',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
    connectTimeout: 20000
};

let db;

function handleDisconnect() {
    db = mysql.createConnection(dbConfig);

    db.connect(err => {
        if (err) {
            console.error('❌ ПОМИЛКА ПІДКЛЮЧЕННЯ ДО БАЗИ:', err.message);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('✅ VitalSync: Хмарна база Aiven на зв’язку!');
            initializeDatabase();
        }
    });

    db.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

function initializeDatabase() {
    const initSql = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        login VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
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
        if (err) console.error('❌ ПОМИЛКА ІНІЦІАЛІЗАЦІЇ ТАБЛИЦЬ:', err.message);
        else console.log('🚀 СТРУКТУРА VitalSync ГОТОВА!');
    });
}

handleDisconnect();

// --- API МАРШРУТИ ---

// Реєстрація та логін
app.post('/api/register', (req, res) => {
    const { login, password } = req.body;
    db.query("SELECT * FROM users WHERE login = ?", [login], (err, results) => {
        if (err) return res.status(500).json({ error: "Помилка бази" });

        if (results.length > 0) {
            if (results[0].password === password) {
                return res.json({ success: true, userId: results[0].id });
            } else {
                return res.status(401).json({ error: "Невірний пароль" });
            }
        } else {
            db.query("INSERT INTO users (login, password) VALUES (?, ?)", [login, password], (err, result) => {
                if (err) return res.status(500).json({ error: "Помилка створення акаунта" });
                res.json({ success: true, userId: result.insertId });
            });
        }
    });
});

// Отримання останнього запису для дашборду
app.get('/api/dashboard/:id', (req, res) => {
    const sql = `
        SELECT u.login, h.* FROM users u 
        LEFT JOIN health_logs h ON u.id = h.user_id 
        WHERE u.id = ? 
        ORDER BY h.date_recorded DESC, h.id DESC 
        LIMIT 1`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results[0] || { login: "Спортсмен" });
    });
});

// НОВИЙ МАРШРУТ ДЛЯ АРХІВУ (History)
app.get('/api/history/:id', (req, res) => {
    console.log(`📜 Запит історії для користувача ID: ${req.params.id}`);
    const sql = "SELECT * FROM health_logs WHERE user_id = ? ORDER BY date_recorded DESC, id DESC";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Оновлення даних
app.post('/api/update', (req, res) => {
    const { userId, weight, height, steps, sleep, water, kcal, kcalTarget, bmi } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const sql = `
        INSERT INTO health_logs (user_id, weight, height, distance_km, sleep_hours, water_liters, calories_intake, kcal_target, date_recorded, bmi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            weight=VALUES(weight), height=VALUES(height), distance_km=VALUES(distance_km),
            sleep_hours=VALUES(sleep_hours), water_liters=VALUES(water_liters),
            calories_intake=VALUES(calories_intake), kcal_target=VALUES(kcal_target), bmi=VALUES(bmi)`;

    db.query(sql, [userId, weight, height, steps, sleep, water, kcal, kcalTarget, today, bmi], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 СЕРВЕР VitalSync ЖИВИЙ НА ПОРТУ ${PORT}`);
});