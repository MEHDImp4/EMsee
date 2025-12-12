const fs = require('fs');
const content = `PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Mehdi@190
DB_NAME=projetjs_db

JWT_SECRET=supersecretkey

DATABASE_URL="mysql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}"`;

fs.writeFileSync('.env', content);
console.log('Written .env');
