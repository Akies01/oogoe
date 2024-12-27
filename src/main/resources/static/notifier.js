export function notify(message, mode = 'screen', email = '') {
    if (mode === 'screen') {
        alert(message);
    } else if (mode === 'sound') {
        loadAndPlayAudio();
    } else if (mode === 'email' && email) {
        sendEmail(email, message);
    }
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

function sendEmail(email, message) {
    fetch('/api/alarms/notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message, mode: 'email' }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error sending email:', data.error);
        } else {
            console.log('Email sent:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
