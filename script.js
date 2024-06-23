const clock = document.querySelector("#clock");
const resetButton = document.querySelector("#reset-button");
const timeInput = document.querySelector("#time-input");
const colorInput = document.querySelector("#color-input");
const logButton = document.querySelector("#log-button");
const calendar = document.querySelector("#calendar");
const logList = document.querySelector("#log-list");
let time = 30;
let intervalId;
let soundFiles = [
    'sounds/1.mp3',
    'sounds/2.mp3',
    'sounds/3.mp3',
    'sounds/4.mp3',
    'sounds/5.mp3',
    'sounds/6.wav'
];

const audio = new Audio();

function countDown() {
    clock.innerHTML = --time;
    if (time === 0) {
        clearInterval(intervalId);
        const randomIndex = Math.floor(Math.random() * soundFiles.length);
        audio.src = soundFiles[randomIndex];
        audio.play();
        const user = auth.currentUser;
        if (user) {
            saveLog(user.uid, timeInput.value || 30);
        }
        time = +timeInput.value || 30;
        clock.innerHTML = time;
        document.body.style.backgroundColor = "black";
        intervalId = setInterval(countDown, 1000);
    } else if (time <= +timeInput.value / 2) {
        document.body.style.backgroundColor = "red";
    }
}

resetButton.addEventListener("click", () => {
    clearInterval(intervalId);
    time = +timeInput.value || 30;
    clock.innerHTML = time;
    document.body.style.backgroundColor = "black";
    intervalId = setInterval(countDown, 1000);
});

timeInput.addEventListener("change", () => {
    time = +timeInput.value || 30;
});

colorInput.addEventListener("change", () => {
    document.body.style.backgroundColor = colorInput.value;
});

logButton.addEventListener("click", () => {
    if (calendar.style.display === "none") {
        calendar.style.display = "block";
        const user = auth.currentUser;
        if (user) {
            fetchLogs(user.uid);
        }
    } else {
        calendar.style.display = "none";
    }
});

intervalId = setInterval(countDown, 1000);
