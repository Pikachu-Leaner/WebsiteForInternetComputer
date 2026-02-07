const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Đọc các biến từ .env
const config = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 10000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Tạo nội dung file config
const configContent = `/**
 * Application Configuration
 * File này được tự động generate từ .env
 * KHÔNG chỉnh sửa file này trực tiếp, hãy sửa .env và chạy: npm run config
 */

const APP_CONFIG = {
  API_BASE_URL: '${config.API_BASE_URL}',
  API_TIMEOUT: ${config.API_TIMEOUT},
  NODE_ENV: '${config.NODE_ENV}',
};

export default APP_CONFIG;
`;

// Đường dẫn file output
const outputPath = path.join(__dirname, '..', 'src', 'js', 'config.js');

// Ghi file
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('Config file đã được generate thành công!');
console.log(`File: ${outputPath}`);
console.log('\n Configuration:');
console.log(`   API_BASE_URL: ${config.API_BASE_URL}`);
console.log(`   API_TIMEOUT: ${config.API_TIMEOUT}ms`);
console.log(`   NODE_ENV: ${config.NODE_ENV}`);

