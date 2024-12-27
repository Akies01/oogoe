import { notify } from './notifier.js';

const addTimerModal = new bootstrap.Modal(document.getElementById('addTimerModal'));

let timers = [];

export function addTimer() {
    const minutes = parseInt(document.getElementById('timer-minutes').value, 10) || 0;
    const seconds = parseInt(document.getElementById('timer-seconds').value, 10) || 0;
    const message = document.getElementById('timer-message').value;
    const mode = document.querySelector('#addTimerForm .btn-primary').getAttribute('onclick').match(/'([^']+)'/)[1];
    const email = document.getElementById('timer-email').value;
    const fileInput = document.getElementById('timer-file');
    const addButton = document.querySelector('#addTimerForm button');

    if (minutes < 0 || seconds < 0 || (minutes === 0 && seconds === 0) || !message || (mode === 'email' && !email) || (mode === 'sound' && !fileInput.files.length)) {
        notify('有効な分と秒、メッセージ、メールアドレス（Eメールモードの場合）、音声ファイル（サウンドモードの場合）を入力してください！');
        return;
    }

    addButton.disabled = true;

    const timerId = `timer-${Date.now()}`;
    const timerEndTime = Date.now() + (minutes * 60 + seconds) * 1000;

    const timerData = { id: timerId, endTime: timerEndTime, message, mode, email, finished: false };
    timers.push(timerData);

    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    storedTimers.push(timerData);
    localStorage.setItem('timers', JSON.stringify(storedTimers));

    addTimerModal.hide();
    fetchTimers();

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
        const audioPlayer = document.getElementById('audioPlayer');
        const blob = await cachedResponse.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.play();
    } else {
        alert('No audio file in cache');
    }
}

export function fetchTimers() {
    timers = JSON.parse(localStorage.getItem('timers')) || [];
    const timerContainer = document.getElementById('timer-container');
    timerContainer.innerHTML = '';

    timers.forEach((timer) => {
        const timerCard = document.createElement('div');
        timerCard.className = 'card my-2';
        timerCard.id = timer.id;

        timerCard.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title" id="display-${timer.id}">${formatRemainingTime(timer.endTime, timer.finished)}</h5>
                    <p class="card-text">${timer.message}</p>
                </div>
                <button class="btn btn-danger" onclick="deleteTimer('${timer.id}')">削除</button>
            </div>
        `;

        timerContainer.appendChild(timerCard);
    });
}

export function formatRemainingTime(endTime, finished) {
    if (finished) {
        return "00:00";
    }
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export function checkTimers() {
    timers.forEach((timer) => {
        if (!timer.finished && Date.now() >= timer.endTime) {
            notify(`タイマー終了: ${timer.message}`, timer.mode, timer.email);
            timer.finished = true;

            const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
            const updatedTimers = storedTimers.map((t) =>
                t.id === timer.id ? { ...t, finished: true } : t
            );
            localStorage.setItem('timers', JSON.stringify(updatedTimers));
        }

        document.getElementById(`display-${timer.id}`).innerText = formatRemainingTime(timer.endTime, timer.finished);
    });
}

export function deleteTimer(id) {
    timers = timers.filter((timer) => timer.id !== id);
    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    const updatedTimers = storedTimers.filter((timer) => timer.id !== id);

    if (updatedTimers.length === 0) {
        localStorage.removeItem('timers'); 
    } else {
        localStorage.setItem('timers', JSON.stringify(updatedTimers));
    }

    document.getElementById(id)?.remove();
}

export function showAddTimerModal() {
    document.getElementById('addTimerForm').reset();
    addTimerModal.show();
}

function selectTimerMode(mode) {
    document.getElementById('timer-file-container').style.display = (mode === 'sound') ? 'block' : 'none';
    document.getElementById('timer-email-container').style.display = (mode === 'email') ? 'block' : 'none';
    document.querySelectorAll('#addTimerForm .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-outline-secondary');
    });
    document.querySelector(`[onclick="selectTimerMode('${mode}')"]`).classList.add('btn-primary');
}
