// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

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

async function signOut() {
    try {
        await firebaseSignOut(auth);
        document.getElementById('user-info').textContent = '';
    } catch (error) {
        console.error('Error during sign-out:', error);
    }
}

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
    updateTabTitle(30);
}

function updateClock() {
    document.getElementById('clock').textContent = remainingTime;
}

let isMuted = false;
const sounds = ['sounds/1.mp3', 'sounds/2.mp3', 'sounds/3.mp3', 'sounds/4.mp3', 'sounds/5.mp3', 'sounds/6.wav'];

document.getElementById('mute-button').addEventListener('click', () => {
    isMuted = !isMuted;
});

function playSound() {
    if (!isMuted) {
        const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
        audio.play();
    }
}

let stopwatchInterval;
let stopwatchTime = 0;

document.getElementById('start-stopwatch').addEventListener('click', () => {
    startStopwatch();
});

document.getElementById('stop-stopwatch').addEventListener('click', () => {
    stopStopwatch();
});

document.getElementById('reset-stopwatch').addEventListener('click', () => {
    resetStopwatch();
});

function startStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        updateStopwatch();
    }, 1000);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    updateStopwatch();
}

function updateStopwatch() {
    const minutes = Math.floor(stopwatchTime / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatch').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
