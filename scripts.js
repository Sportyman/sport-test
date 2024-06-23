document.addEventListener('DOMContentLoaded', () => {
    const counterElement = document.getElementById('counter');
    const resetStartButton = document.getElementById('reset-start-btn');
    const muteButton = document.getElementById('mute-btn');
    const counterInput = document.getElementById('counter-input');
    const stopwatchElement = document.getElementById('stopwatch');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    const stopButton = document.getElementById('stop-btn');
    const toggleDocButton = document.getElementById('toggle-doc-btn');
    const trainingLog = document.getElementById('training-log');
    const beepSound = document.getElementById('beep-sound');

    let counterTime = 4;
    let counterInterval;
    let isMuted = false;
    let isCounting = false;

    let stopwatchInterval;
    let stopwatchTime = 0;
    let isStopwatchRunning = false;

    function updateCounter() {
        if (!isCounting) return;
        if (counterTime > 0) {
            counterElement.textContent = counterTime;
            document.title = `Counter: ${counterTime}`;
            if (counterTime <= 2) {
                document.body.style.backgroundColor = 'red';
            } else {
                document.body.style.backgroundColor = 'black';
            }
            counterTime--;
        } else {
            if (!isMuted) beepSound.play();
            counterTime = parseInt(counterInput.value) || 4;
            setTimeout(updateCounter, 2000);
        }
    }

    function startCounter() {
        if (counterInterval) clearInterval(counterInterval);
        counterTime = parseInt(counterInput.value) || 4;
        counterElement.textContent = counterTime;
        isCounting = true;
        counterInterval = setInterval(updateCounter, 1000);
    }

    function resetCounter() {
        isCounting = false;
        clearInterval(counterInterval);
        startCounter();
    }

    resetStartButton.addEventListener('click', resetCounter);

    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
    });

    counterInput.addEventListener('blur', () => {
        if (!isCounting) {
            counterTime = parseInt(counterInput.value) || 4;
            counterElement.textContent = counterTime;
        }
    });

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function startStopwatch() {
        if (stopwatchInterval) clearInterval(stopwatchInterval);
        stopwatchInterval = setInterval(() => {
            stopwatchTime += 1000;
            stopwatchElement.textContent = formatTime(stopwatchTime);
        }, 1000);
        isStopwatchRunning = true;
    }

    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
    }

    function stopStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        stopwatchElement.textContent = formatTime(stopwatchTime);
        isStopwatchRunning = false;
    }

    startButton.addEventListener('click', startStopwatch);
    pauseButton.addEventListener('click', pauseStopwatch);
    stopButton.addEventListener('click', stopStopwatch);

    toggleDocButton.addEventListener('click', () => {
        trainingLog.classList.toggle('hidden');
    });

    function saveTrainingLog() {
        const now = new Date();
        const duration = formatTime(stopwatchTime);
        const entry = `On ${now.toLocaleDateString()}, at ${now.toLocaleTimeString()} practiced for ${duration}`;
        const logEntry = document.createElement('div');
        logEntry.textContent = entry;
        trainingLog.appendChild(logEntry);
    }

    window.addEventListener('beforeunload', saveTrainingLog);

    startCounter();
    startStopwatch();
});
