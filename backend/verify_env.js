const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');

const envConfig = dotenv.config({ path: path.join(__dirname, '.env') });
console.log('Parsed:', envConfig.parsed);
const expanded = dotenvExpand.expand(envConfig);
console.log('Expanded Parsed:', expanded.parsed);
console.log('FINAL_URL:', process.env.DATABASE_URL);
