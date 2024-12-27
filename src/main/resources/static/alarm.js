const addAlarmModal = new bootstrap.Modal(document.getElementById('addAlarmModal'));

export function showAddAlarmModal() {
    document.getElementById('addAlarmForm').reset();
    addAlarmModal.show();
}

export function notify(message, mode = 'screen', email = '') {
    if (mode === 'screen') {
        alert(message);
    } else if (mode === 'email' && email) {
        sendEmail(email, message);
    } else if (mode === 'sound') {
        loadAndPlayAudio();
    }
}

export function addAlarm() {
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    const mode = document.querySelector('#addAlarmForm .btn-primary').getAttribute('onclick').match(/'([^']+)'/)[1];
    const email = document.getElementById('alarm-email').value;
    const addButton = document.querySelector('#addAlarmForm button');
    const fileInput = document.getElementById('alarm-file');

    if (!time || !message || (mode === 'email' && !email) || (mode === 'sound' && !fileInput.files.length)) {
        notify('時間、メッセージ、有効なメール アドレスを入力してください。');
        return;
    }

    addButton.disabled = true;

    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.push({ time, message, mode, email, triggered: false });
    localStorage.setItem('alarms', JSON.stringify(alarms));
    addAlarmModal.hide();
    fetchAlarms();

    if (mode === 'sound') {
        uploadAndCacheAudio(fileInput.files[0]);
    }

    setTimeout(() => (addButton.disabled = false), 500);
}

function uploadAndCacheAudio(file) {
    const reader = new FileReader();
    reader.onload = async function(event) {
        const arrayBuffer = event.target.result;
        const response = new Response(arrayBuffer);
        const cache = await caches.open('audio-cache');
        await cache.put('/audio-file', response);
        alert('Audio file cached');
    };
    reader.readAsArrayBuffer(file);
}

async function loadAndPlayAudio() {
    const cache = await caches.open('audio-cache');
    const cachedResponse = await cache.match('/audio-file');
    if (cachedResponse) {
        const audioPlayer = document.createElement('audio');
        const blob = await cachedResponse.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.play();
    } else {
        alert('No audio file in cache');
    }
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
                <button class="btn btn-danger" onclick="deleteAlarm(${index})">削除</button>
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}
