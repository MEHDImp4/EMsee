const http = require('http');

const data = JSON.stringify({
    username: 'testuser',
    email: 'test@emsi-edu.ma'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/check-availability', // Correct path
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Sending request to http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log('RESPONSE:', rawData);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
