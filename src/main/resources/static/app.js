const addAlarmModal = new bootstrap.Modal(document.getElementById('addAlarmModal'));
const addTimerModal = new bootstrap.Modal(document.getElementById('addTimerModal'));

let timers = [];

function addAlarm() {
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    const addButton = document.querySelector('#addAlarmForm button');

    if (!time || !message) {
        alert('時間とメッセージを両方入力してください！');
        return;
    }

    addButton.disabled = true;

    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.push({ time, message, triggered: false });
    localStorage.setItem('alarms', JSON.stringify(alarms));
    addAlarmModal.hide();
    fetchAlarms();

    setTimeout(() => (addButton.disabled = false), 500);
}

function fetchAlarms() {
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

function deleteAlarm(index) {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.splice(index, 1);

    if (alarms.length === 0) {
        localStorage.removeItem('alarms'); // 키값 제거
    } else {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }

    fetchAlarms();
}

function showAddAlarmModal() {
    document.getElementById('addAlarmForm').reset();
    addAlarmModal.show();
}

function showAddTimerModal() {
    document.getElementById('addTimerForm').reset();
    addTimerModal.show();
}

function addTimer() {
    const minutes = parseInt(document.getElementById('timer-minutes').value, 10) || 0;
    const seconds = parseInt(document.getElementById('timer-seconds').value, 10) || 0;
    const message = document.getElementById('timer-message').value;
    const addButton = document.querySelector('#addTimerForm button');

    if (minutes < 0 || seconds < 0 || (minutes === 0 && seconds === 0) || !message) {
        alert('有効な分と秒、メッセージを入力してください！');
        return;
    }

    addButton.disabled = true;

    const timerId = `timer-${Date.now()}`;
    const timerEndTime = Date.now() + (minutes * 60 + seconds) * 1000;

    const timerData = { id: timerId, endTime: timerEndTime, message, finished: false };
    timers.push(timerData);

    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    storedTimers.push(timerData);
    localStorage.setItem('timers', JSON.stringify(storedTimers));

    addTimerModal.hide();
    fetchTimers();

    setTimeout(() => (addButton.disabled = false), 500);
}

function fetchTimers() {
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

function formatRemainingTime(endTime, finished) {
    if (finished) {
        return "00:00";
    }
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function checkTimers() {
    timers.forEach((timer) => {
        if (!timer.finished && Date.now() >= timer.endTime) {
            alert(`タイマー終了: ${timer.message}`);
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

function deleteTimer(id) {
    timers = timers.filter((timer) => timer.id !== id);
    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    const updatedTimers = storedTimers.filter((timer) => timer.id !== id);

    if (updatedTimers.length === 0) {
        localStorage.removeItem('timers'); // 키값 제거
    } else {
        localStorage.setItem('timers', JSON.stringify(updatedTimers));
    }

    document.getElementById(id)?.remove();
}

window.onload = () => {
    fetchAlarms();
    fetchTimers();
    setInterval(checkTimers, 1000);
};
