window.onload = () => {
    fetchAlarms();
    fetchTimers();
    setInterval(() => {
        checkTimers();
        checkAlarms();
    }, 1000);
};
