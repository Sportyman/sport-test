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
                if (auth.currentUser) {
                    saveLog(auth.currentUser.uid, duration, 'default');
                }
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
        const audio = new Audio('sounds/finished-sounds/1.mp3'); // Change this to your actual path
        audio.play();
    }
}

// Log button functionality
document.getElementById('log-button').addEventListener('click', () => {
    const calendar = document.getElementById('calendar');
    calendar.style.display = calendar.style.display === 'none' ? 'block' : 'none';
});

// Stopwatch functionality
let stopwatchInterval;
let stopwatchTime = 0;
let stopwatchRunning = false;

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('start-stopwatch').addEventListener('click', () => {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchInterval = setInterval(() => {
            stopwatchTime++;
            document.getElementById('stopwatch').textContent = formatTime(stopwatchTime);
        }, 1000);
    }
});

document.getElementById('stop-stopwatch').addEventListener('click', () => {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
});

document.getElementById('reset-stopwatch').addEventListener('click', () => {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    document.getElementById('stopwatch').textContent = '0:00';
});

// Chart.js functionality
const ctx = document.getElementById('progress-chart').getContext('2d');
const progressChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Workout 1', 'Workout 2', 'Workout 3'],
        datasets: [{
            label: 'Duration (seconds)',
            data: [30, 45, 60],
            backgroundColor: ['red', 'green', 'blue'],
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
