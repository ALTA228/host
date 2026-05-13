<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>VitalSync — Термінал Користувача</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>

    <header style="display: flex; align-items: center; justify-content: flex-start; padding-left: 40px; position: relative;">
        <img src="media/logo.png" width="70" alt="VitalSync Logo" style="border-radius: 10px; border: 1px solid #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.3); margin-right: auto;">
        <h1 style="position: absolute; left: 50%; transform: translateX(-50%); margin: 0; font-size: 1.5em;">VITALSYNC :: ПАНЕЛЬ УПРАВЛІННЯ</h1>
    </header>

    <div class="clearfix">
        <div id="leftBlock">
            <center>
                <img src="media/ava.jpg" width="180" style="border: 2px solid #00d4ff; border-radius: 10px; filter: drop-shadow(0 0 8px #00d4ff);">
                <h2 id="user-name" style="font-size: 1.1em; color: #fff;">ПЕРЕВІРКА...</h2>
                <p><b id="user-id-display" style="color: #00d4ff;">ID: ---</b></p>
            </center>
            <hr color="#1a2635">
            <div style="display: flex; justify-content: space-around; margin: 15px 0;">
                <a href="index.html" title="Головна"><img src="media/icon_home.png" width="45"></a>
                <a href="activity.html" title="Активність"><img src="media/icon_activity.png" width="45"></a>
                <a href="sleep.html" title="Сон"><img src="media/icon_sleep.png" width="45"></a>
            </div>
            <center>
                <input type="button" value="ВИХІД" onclick="logout()" style="background: #ff4b2b; color: #fff; border: none; padding: 10px; cursor: pointer; border-radius: 5px; font-weight: bold; width: 80%;">
            </center>
        </div>

        <div id="infopage">
            <h3 style="color: #00d4ff; border-bottom: 1px solid #1a2635; padding-bottom: 5px; margin-top: 0;">[ ТЕРМІНАЛ ВВОДУ ДАНИХ ]</h3>
            <form id="sync-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div class="input-group">
                    <label>Зріст (CM):</label>
                    <input type="number" id="in-height" class="terminal-field" placeholder="180">
                </div>
                <div class="input-group">
                    <label>Вага (KG):</label>
                    <input type="number" id="in-weight" class="terminal-field" placeholder="75">
                </div>
                <div class="input-group">
                    <label>Активність (KM):</label>
                    <input type="number" id="in-activity" class="terminal-field" placeholder="5.0">
                </div>
                <div class="input-group">
                    <label>Сон (години):</label>
                    <input type="number" id="in-sleep" class="terminal-field" placeholder="8">
                </div>
                <div class="input-group">
                    <label>Калорії (спожито):</label>
                    <input type="number" id="in-kcal" class="terminal-field" placeholder="2500">
                </div>
                <div class="input-group">
                    <label>Ваша ціль (kcal):</label>
                    <input type="number" id="in-target" class="terminal-field" placeholder="2700">
                </div>
                <div class="input-group">
                    <label>Вода (L):</label>
                    <input type="number" id="in-water" class="terminal-field" placeholder="2.00">
                </div>
            </form>
            <div style="text-align: center; margin-top: 25px;">
                <button id="btn-process" class="butt-neon">ОБРОБИТИ ТА ЗАПИСАТИ В SQL</button>
            </div>
        </div>

        <div id="rightBlock">
            <h3 align="center" style="color: #00d4ff;">SYSTEM_MONITOR</h3>
            <div class="status-container">
                <span class="pulse-dot"></span>
                <span class="status-text">SQL_STREAM: ACTIVE</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 5px; border-left: 3px solid #00d4ff; margin-bottom: 15px;">
                <small style="color: #00d4ff; font-family: monospace;">VITAL_AI_ADVICE:</small>
                <p id="ai-advice" style="font-size: 1.1em; color: #00d4ff; font-style: italic; margin-top: 5px; text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);">
                    Баланс ідеальний. Продовжуйте в тому ж дусі!
                </p>
            </div>
            <div style="font-size: 0.9em; color: #566573; font-family: monospace; background: #070b14; padding: 10px; border: 1px solid #1a2635;">
                > DB_HOST: <span style="color: #2ecc71;">AIVEN_CLOUD</span><br>
                > DATABASE: <span style="color: #f1c40f;">VitalSync_Project</span><br>
                > TABLE: <span style="color: #00d4ff;">health_logs</span><br>
                > SYNC_MODE: <span style="color: #2ecc71;">LIVE</span><br>
                <hr style="border: 0; border-top: 1px dashed #1a2635; margin: 8px 0;">
                <span style="color: #94a3b8;">// SYSTEM_LOGS:</span><br>
                <span id="log-time">00:00:00</span> | Session validated<br>
                <span id="log-action" style="color: #00d4ff;">Ready for sync...</span>
            </div>
            <div style="text-align: center; margin-top: 25px;">
                <a href="history.html" class="butt-neon" style="display: block; text-decoration: none; color: #00d4ff;">ІСТОРІЯ СИНХРОНІЗАЦІЇ</a>
            </div>
        </div>
    </div>

    <div style="width: 98%; margin: 25px auto;">
        <h3 align="center" style="color: #00d4ff; text-transform: uppercase;">Біометричний звіт VitalSync</h3>
        <table border="1" width="100%" cellpadding="15" cellspacing="0" bordercolor="#00d4ff" style="background: #0b111a; border-collapse: collapse; text-align: center;">
            <tr bgcolor="#16212e" style="color: #00d4ff;">
                <th>Параметр</th><th>Значення</th><th>Дата запису</th><th>Статус аналітики</th>
            </tr>
            <tr style="background: rgba(0, 212, 255, 0.1);">
                <td><b>ІНДЕКС МАСИ ТІЛА (ІМТ)</b></td><td id="bmi-display">0.0</td><td class="date-cell">--.--.----</td><td id="bmi-status">---</td>
            </tr>
            <tr><td>Зріст / Вага</td><td><span id="height-display">0</span> cm / <span id="weight-display">0.0</span> kg</td><td class="date-cell">--.--.----</td><td>Антропометрія</td></tr>
            <tr><td><b>Калорії (доба)</b></td><td id="kcal-display" style="color: #00d4ff; font-weight: bold;">0</td><td class="date-cell">--.--.----</td><td id="kcal-target-cell">Ціль: 0</td></tr>
            <tr style="background: rgba(46, 204, 113, 0.05);"><td style="color: #2ecc71;">ЕНЕРГЕТИЧНИЙ БАЛАНС</td><td>П: <span id="profit-display">0</span> / Д: <span id="deficit-display">0</span></td><td class="date-cell">--.--.----</td><td id="balance-info">---</td></tr>
            <tr><td>Активність (KM)</td><td id="distance-display">0.0</td><td class="date-cell">--.--.----</td><td>Ціль: 5.0 KM</td></tr>
            <tr><td>Сон (години)</td><td id="sleep-display">0</td><td class="date-cell">--.--.----</td><td>Відновлення</td></tr>
            <tr><td>Вода (L)</td><td id="water-display">0.00</td><td class="date-cell">--.--.----</td><td style="color: #00d4ff;">Гідрація</td></tr>
        </table>
    </div>

    <script>
        const currentUserId = localStorage.getItem('vitalsync_id');
        if (!currentUserId) { window.location.href = 'register.html'; }

        function updateLog(action, color = "#00d4ff") {
            const now = new Date();
            document.getElementById('log-time').innerText = now.toLocaleTimeString();
            const actionEl = document.getElementById('log-action');
            actionEl.innerText = action;
            actionEl.style.color = color;
        }

        async function loadVitalSyncData() {
            try {
                updateLog("Fetching from VitalSync_Project...");
                const response = await fetch(`https://host-47lb.onrender.com/api/dashboard/${currentUserId}`);
                const data = await response.json();

                if (data && data.login) {
                    document.getElementById('user-name').innerText = data.login.toUpperCase();
                    document.getElementById('user-id-display').innerText = `ID: ${currentUserId}-SQL_PROD`;
                    document.getElementById('height-display').innerText = data.height || '0';
                    document.getElementById('weight-display').innerText = data.weight || '0.0';
                    document.getElementById('distance-display').innerText = data.distance_km || '0.0';
                    document.getElementById('sleep-display').innerText = data.sleep_hours || '0';
                    document.getElementById('kcal-display').innerText = data.calories_intake || '0';
                    document.getElementById('kcal-target-cell').innerText = `Ціль: ${data.kcal_target || 0}`;
                    document.getElementById('water-display').innerText = parseFloat(data.water_liters || 0).toFixed(2);

                    let bmiVal = parseFloat(data.bmi) || 0;
                    document.getElementById('bmi-display').innerText = bmiVal.toFixed(1);
                    const bmiStatus = document.getElementById('bmi-status');
                    if (bmiVal > 0) {
                        if (bmiVal < 18.5) { bmiStatus.innerText = "Дефіцит ваги"; bmiStatus.style.color = "#f1c40f"; }
                        else if (bmiVal <= 25) { bmiStatus.innerText = "Норма"; bmiStatus.style.color = "#2ecc71"; }
                        else { bmiStatus.innerText = "Надмірна вага"; bmiStatus.style.color = "#ff4b2b"; }
                    }

                    const kcal = parseInt(data.calories_intake) || 0;
                    const target = parseInt(data.kcal_target) || 2500;
                    const diff = kcal - target;
                    document.getElementById('profit-display').innerText = diff > 0 ? diff : 0;
                    document.getElementById('deficit-display').innerText = diff < 0 ? Math.abs(diff) : 0;
                    document.getElementById('balance-info').innerHTML = diff > 0 ? `<span style="color:#ff4b2b">Профіцит</span>` : `<span style="color:#2ecc71">Норма</span>`;
                    
                    const d = new Date();
                    const ds = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
                    document.querySelectorAll('.date-cell').forEach(el => el.innerText = ds);
                    updateLog("VITAL_PROJECT: CONNECTED", "#2ecc71");
                }
            } catch (err) { updateLog("Database unreachable", "#ff4b2b"); }
        }

        document.getElementById('btn-process').onclick = async () => {
            updateLog("Writing to VitalSync_Project...", "#f1c40f");
            const h = parseFloat(document.getElementById('in-height').value) || 0;
            const w = parseFloat(document.getElementById('in-weight').value) || 0;
            const bmiCalc = (w && h) ? (w / ((h / 100) ** 2)).toFixed(2) : 0;

            const payload = {
                userId: currentUserId, weight: w, height: h,
                steps: document.getElementById('in-activity').value || 0,
                sleep: document.getElementById('in-sleep').value || 0,
                water: document.getElementById('in-water').value || 0,
                kcal: document.getElementById('in-kcal').value || 0,
                kcalTarget: document.getElementById('in-target').value || 0,
                bmi: bmiCalc
            };

            try {
                const response = await fetch('https://host-47lb.onrender.com/api/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    updateLog("VitalSync SQL: RECORDED", "#2ecc71");
                    alert("SQL СИНХРОНІЗАЦІЯ У VitalSync_Project ЗАВЕРШЕНА");
                    loadVitalSyncData();
                }
            } catch (err) { updateLog("API unreachable", "#ff4b2b"); }
        };

        function logout() { localStorage.removeItem('vitalsync_id'); window.location.href = 'register.html'; }
        window.onload = loadVitalSyncData;
    </script>
</body>
</html>