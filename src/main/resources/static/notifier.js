let audioPlayer;

export function loadAndPlayAudio() {
    caches.open('audio-cache').then(async (cache) => {
        const cachedResponse = await cache.match('/audio-file');
        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            const url = URL.createObjectURL(blob);
            audioPlayer = new Audio(url);
            audioPlayer.play();
        } else {
            alert('オーディオファイルがありません。');
        }
    });
}

export function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer = null;
    }
}

window.stopAudio = stopAudio;

export function notify(message, mode = 'screen', email = '') {
    if (mode === 'screen') {
        alert(message);
    } else if (mode === 'sound') {
        loadAndPlayAudio();
    } else if (mode === 'email' && email) {
        sendEmail(email, message);
    }
}

export function sendEmail(email, message) {
    fetch('/api/alarms/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, mode: 'email' }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network not ok');
            }
            return response.text();
        })
        .then((text) => {
            try {
                const data = JSON.parse(text);
                if (data.error) {
                    console.error('Error sending email:', data.error);
                } else {
                    console.log('Email sent:', data.message);
                }
            } catch (error) {
                console.log('Response is not JSON:', text);
            }
        })
        .catch((error) => console.error('Error:', error));
}
