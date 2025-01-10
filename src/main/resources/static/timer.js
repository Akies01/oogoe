import { notify, loadAndPlayAudio, stopAudio } from './notifier.js';

const addTimerModal = new bootstrap.Modal(document.getElementById('addTimerModal'));

let timers = [];

export function addTimer() {
    const minutes = parseInt(document.getElementById('timer-minutes').value, 10) || 0;
    const seconds = parseInt(document.getElementById('timer-seconds').value, 10) || 0;
    const message = document.getElementById('timer-message').value;
    const mode = document.querySelector('#addTimerForm .btn-primary').getAttribute('onclick').match(/'([^']+)'/)[1];
    const email = document.getElementById('timer-email').value;
    const fileInput = document.getElementById('timer-file');

    if (minutes < 0 || seconds < 0 || (minutes === 0 && seconds === 0) || !message || (mode === 'email' && !email) || (mode === 'sound' && !fileInput.files.length)) {
        notify('有効な分、秒、メッセージ、メールアドレスまたは音声ファイルを入力してください！');
        return;
    }

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
                <div>
                    <button class="btn btn-danger" onclick="deleteTimer('${timer.id}')">削除</button>
                    ${
                        timer.mode === 'sound'
                            ? `<button class="btn btn-warning" onclick="stopAudio()">音声停止</button>`
                            : ''
                    }
                </div>
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
