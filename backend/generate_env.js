const fs = require('fs');
const DEFAULT_PORT = 5000;
const DEFAULT_DB_HOST = 'localhost';
const DEFAULT_DB_PORT = 3306;
const DB_USER = 'root';
const DB_PASS_SUFFIX = '190';
const DEFAULT_DB_NAME = 'projetjs_db';
const JWT_SECRET = 'supersecretkey';

const content = `PORT=${DEFAULT_PORT}
DB_HOST=${DEFAULT_DB_HOST}
DB_PORT=${DEFAULT_DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=Mehdi@${DB_PASS_SUFFIX}
DB_NAME=${DEFAULT_DB_NAME}

JWT_SECRET=${JWT_SECRET}

DATABASE_URL="mysql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}"`;

fs.writeFileSync('.env', content);
console.log('Written .env');
