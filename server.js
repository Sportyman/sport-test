const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

let logs = [];

app.use(bodyParser.json());
app.use(express.static('public'));

// Load logs from file if exists
if (fs.existsSync('logs.json')) {
    logs = JSON.parse(fs.readFileSync('logs.json'));
}

// Endpoint to get logs
app.get('/log', (req, res) => {
    res.json(logs);
});

// Endpoint to save log
app.post('/log', (req, res) => {
    const log = req.body;
    logs.push(log);
    fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
    res.status(201).json(log);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
