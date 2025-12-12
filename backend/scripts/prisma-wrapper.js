const { execSync } = require('child_process');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');

// Load and expand env vars from the backend root
const envConfig = dotenv.config({ path: path.join(__dirname, '../.env') });
dotenvExpand.expand(envConfig);

// Get arguments passed to the script (e.g., "studio" or "migrate dev")
const args = process.argv.slice(2).join(' ');

if (!args) {
    console.error('Please provide a Prisma command (e.g., studio, migrate dev)');
    process.exit(1);
}

const command = `npx prisma ${args}`;

console.log(`Running: ${command}`);

try {
    execSync(command, { stdio: 'inherit', env: process.env });
} catch (error) {
    process.exit(1);
}
