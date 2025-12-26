const http = require('http');

const generatedUsername = 'u' + Date.now().toString().slice(-6); // Max 10 chars
const generatedEmail = 'u' + Date.now().toString().slice(-6) + '@emsi-edu.ma';

const data = JSON.stringify({
    username: generatedUsername,
    email: generatedEmail,
    password: 'Password123',
    full_name: 'Test User',
    role: 'student',
    subjects: ['Math', 'Physics'],
    filiere: 'IIR',
    year: '4',
    studentClass: 'IIR4 G1'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log('RESPONSE DATA:', JSON.stringify(parsedData, null, 2));

            if (res.statusCode === 201) {
                const token = parsedData.token;
                console.log('User created successfully. Verifying read for username:', generatedUsername);

                // Verify Read
                const readOptions = {
                    hostname: 'localhost',
                    port: 5001,
                    path: `/api/users/${generatedUsername}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                const readReq = http.request(readOptions, (readRes) => {
                    console.log(`READ STATUS: ${readRes.statusCode}`);
                    let readData = '';
                    readRes.on('data', c => readData += c);
                    readRes.on('end', () => {
                        try {
                            const userObj = JSON.parse(readData);
                            console.log('READ USER:', JSON.stringify(userObj, null, 2));

                            // The structure might be { user: { ... } } or just { ... } or { data: ... }
                            // userController.getProfile usually returns the user object directly or wrapped.
                            // Let's inspect userObj.
                            const target = userObj.user || userObj;

                            if (target.subjects && Array.isArray(target.subjects)) {
                                console.log('SUCCESS: subjects is an Array:', target.subjects);
                            } else {
                                console.log('FAILURE: subjects is not an Array:', typeof target.subjects, target.subjects);
                            }
                        } catch (e) { console.error('Read parse error', e); }
                    });
                });
                readReq.end();

            }
        } catch (e) {
            console.error('Failed to parse response:', e.message);
            console.log('RAW BODY:', rawData);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
