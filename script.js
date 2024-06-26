// Firebase imports
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// Firebase Auth functions
async function signIn() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        document.getElementById('user-info').textContent = `Hello, ${user.displayName}`;
        fetchLogs(user.uid);
    } catch (error) {
        console.error('Error during sign-in:', error);
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
        document.getElementById('user-info').textContent = '';
    } catch (error) {
        console.error('Error during sign-out:', error);
    }
}

// Event listeners for sign-in and sign-out
document.getElementById('login-button').addEventListener('click', signIn);
document.getElementById('logout-button').addEventListener('click', signOutUser);

// Functions to save and fetch logs
async function saveLog(uid, duration, category) {
    try {
        await addDoc(collection(db, 'workoutLogs'), {
            uid,
            duration,
            category,
            date: new Date().toISOString()
        });
        fetchLogs(uid);
    } catch (error) {
        console.error('Error saving log:', error);
    }
}

async function fetchLogs(uid) {
    try {
        const q = query(collection(db, 'workoutLogs'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const logList = document.getElementById('log-list');
        logList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const log = doc.data();
            const logItem = document.createElement('li');
            logItem.textContent = `Date: ${new Date(log.date).toLocaleString()}, Duration: ${log.duration} seconds, Category: ${log.category}`;
            logList.appendChild(logItem);
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

// Timer functionality
let countdownInterval;
let remainingTime;
let isPaused = false;

function updateTabTitle(time) {
    document.title = `Time: ${time}s`;
}

document.getElementById('start-button').addEventListener('click', () => {
    const inputTime = parseInt(document.getElementById('time-input').value) || 30;
    startTimer(inputTime);
});

document.getElementById('pause-button').addEventListener('click', () => {
    pauseTimer();
});

document.getElementById('resume-button').addEventListener('click', () => {
    resumeTimer();
});

document.getElementById('reset-button').addEventListener('click', () => {
    resetTimer();
});

function startTimer(duration) {
    clearInterval(countdownInterval);
    remainingTime = duration;
    updateClock();
    countdownInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime--;
            updateClock();
            updateTabTitle(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                playSound();
                saveLog(auth.currentUser.uid, duration, 'default');
            }
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    isPaused = false;
}

function resetTimer() {
    clearInterval(countdownInterval);
    document.getElementById('clock').textContent = '30';
    updateTabTitle('');
}

function updateClock() {
    document.getElementById('clock').textContent = remainingTime;
}

// Mute functionality
let isMuted = false;

document.getElementById('mute-button').addEventListener('click', () => {
    isMuted = !isMuted;
    document.getElementById('mute-button').textContent = isMuted ? 'Unmute' : 'Mute';
});

function playSound() {
    if (!isMuted) {
        const audio = new Audio('sounds/finished-sounds/1.mp3'); // Example sound path
        audio.play();
    }
}

// Toggle log visibility
document.getElementById('log-button').addEventListener('click', () => {
    const calendar = document.getElementById('calendar');
    calendar.style.display = calendar.style.display === 'none' ? 'block' : 'none';
});

// Stopwatch functionality
let stopwatchInterval;
let stopwatchTime = 0;

document.getElementById('start-stopwatch').addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        updateStopwatch();
    }, 1000);
});

document.getElementById('stop-stopwatch').addEventListener('click', () => {
    clearInterval(stopwatchInterval);
});

document.getElementById('reset-stopwatch').addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    updateStopwatch();
});

function updateStopwatch() {
    const minutes = Math.floor(stopwatchTime / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatch').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Chart.js integration
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js";

const ctx = document.getElementById('progress-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Workout Progress',
            data: [],
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

async function updateChart(uid) {
    const q = query(collection(db, 'workoutLogs'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    const labels = [];
    const data = [];
    querySnapshot.forEach((doc) => {
        const log = doc.data();
        labels.push(new Date(log.date).toLocaleDateString());
        data.push(log.duration);
    });
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Update chart when user logs in
auth.onAuthStateChanged((user) => {
    if (user) {
        updateChart(user.uid);
    }
});
