import { notify, loadAndPlayAudio, stopAudio } from './notifier.js';

const addAlarmModal = new bootstrap.Modal(document.getElementById('addAlarmModal'));

export function showAddAlarmModal() {
    document.getElementById('addAlarmForm').reset();
    addAlarmModal.show();
}

export function addAlarm() {
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    const mode = document.querySelector('#addAlarmForm .btn-primary').getAttribute('onclick').match(/'([^']+)'/)[1];
    const email = document.getElementById('alarm-email').value;
    const fileInput = document.getElementById('alarm-file');

    if (!time || !message || (mode === 'email' && !email) || (mode === 'sound' && !fileInput.files.length)) {
        notify('時間、メッセージ、有効なメールアドレスまたは音声ファイルを入力してください。');
        return;
    }

    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.push({ time, message, mode, email, triggered: false });
    localStorage.setItem('alarms', JSON.stringify(alarms));
    addAlarmModal.hide();
    fetchAlarms();

    if (mode === 'sound') {
        uploadAndCacheAudio(fileInput.files[0]);
    }
}

function uploadAndCacheAudio(file) {
    const reader = new FileReader();
    reader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const response = new Response(arrayBuffer);
        const cache = await caches.open('audio-cache');
        await cache.put('/audio-file', response);
        alert('オーディオファイルを保存しました。');
    };
    reader.readAsArrayBuffer(file);
}

export function fetchAlarms() {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    const alarmContainer = document.getElementById('alarm-container');
    alarmContainer.innerHTML = '';

    alarms.forEach((alarm, index) => {
        const alarmCard = document.createElement('div');
        alarmCard.className = 'card my-2';

        alarmCard.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title">${alarm.time}</h5>
                    <p class="card-text">${alarm.message}</p>
                </div>
                <div>
                    <button class="btn btn-danger" onclick="deleteAlarm(${index})">削除</button>
                    ${
                        alarm.mode === 'sound'
                            ? `<button class="btn btn-warning" onclick="stopAudio()">音声停止</button>`
                            : ''
                    }
                </div>
            </div>
        `;

        alarmContainer.appendChild(alarmCard);
    });
}

export function deleteAlarm(index) {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.splice(index, 1);

    if (alarms.length === 0) {
        localStorage.removeItem('alarms');
    } else {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }

    fetchAlarms();
}

export function checkAlarms() {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    const now = new Date();

    alarms.forEach((alarm) => {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmTime = new Date();
        alarmTime.setHours(hours, minutes, 0, 0);

        if (!alarm.triggered && now >= alarmTime) {
            notify(`アラーム: ${alarm.message}`, alarm.mode, alarm.email);
            alarm.triggered = true;

            localStorage.setItem('alarms', JSON.stringify(alarms));
        }
    });
}
