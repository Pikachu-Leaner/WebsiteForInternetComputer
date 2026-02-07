# Hướng dẫn cấu hình biến môi trường (.env)

## Tổng quan

Project sử dụng file `.env` để quản lý các biến cấu hình như API URL, timeout, etc. Các biến này sẽ được đọc và generate thành file `src/js/config.js` để sử dụng trong browser.

## Thiết lập

### Bước 1: Tạo file .env

Copy file `.env.example` thành `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### Bước 2: Chỉnh sửa file .env

Mở file `.env` và điền các giá trị thực tế:

```env
# API Configuration
API_BASE_URL=http://localhost:3000/api

# Environment
NODE_ENV=development

# API Timeout (milliseconds)
API_TIMEOUT=10000
```

### Bước 3: Generate config file

Chạy script để generate file config từ .env:

```bash
npm run config
```

Hoặc file sẽ tự động được generate khi bạn chạy `npm start` (nhờ script `prestart`).

## Sử dụng

Sau khi generate, file `src/js/config.js` sẽ được tạo ra và được sử dụng trong `src/js/api.js`:

```javascript
import APP_CONFIG from './config.js';

// Sử dụng config
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
});
```

## Các biến môi trường

### API_BASE_URL

Base URL cho API backend.

**Mặc định**: `http://localhost:3000/api`

**Ví dụ**:
```env
API_BASE_URL=http://localhost:3000/api
API_BASE_URL=https://api.example.com
API_BASE_URL=https://api.example.com/v1
```

### API_TIMEOUT

Timeout cho API requests (milliseconds).

**Mặc định**: `10000` (10 giây)

**Ví dụ**:
```env
API_TIMEOUT=5000   # 5 giây
API_TIMEOUT=15000  # 15 giây
```

### NODE_ENV

Environment mode.

**Mặc định**: `development`

**Giá trị**: `development` | `production`

**Ví dụ**:
```env
NODE_ENV=development
NODE_ENV=production
```

## Workflow

1. **Development**: Sửa `.env` → Chạy `npm run config` → Chạy `npm start`
2. **Auto generate**: Chạy `npm start` sẽ tự động generate config trước khi start server

## Lưu ý

### Không commit file .env

File `.env` chứa thông tin nhạy cảm và đã được thêm vào `.gitignore`. Chỉ commit file `.env.example`.

### Không sửa trực tiếp src/js/config.js

File `src/js/config.js` được tự động generate từ `.env`. Nếu bạn sửa trực tiếp, các thay đổi sẽ bị ghi đè khi chạy `npm run config` lại.

### Cách làm đúng

1. Sửa file `.env`
2. Chạy `npm run config` để generate lại
3. Hoặc chỉ cần chạy `npm start` (sẽ tự động generate)

## Thêm biến môi trường mới

Nếu bạn muốn thêm biến môi trường mới:

1. Thêm vào `.env.example`:
   ```env
   # New variable
   NEW_VAR=default_value
   ```

2. Cập nhật `scripts/generate-config.js`:
   ```javascript
   const config = {
     // ... existing config
     NEW_VAR: process.env.NEW_VAR || 'default_value',
   };
   
   const configContent = `...
     NEW_VAR: '${config.NEW_VAR}',
   ...`;
   ```

3. Sử dụng trong code:
   ```javascript
   import APP_CONFIG from './config.js';
   console.log(APP_CONFIG.NEW_VAR);
   ```

4. Chạy `npm run config` để generate lại

## Troubleshooting

### Config file không được generate

```bash
# Kiểm tra file .env có tồn tại không
ls .env

# Chạy script generate thủ công
npm run config
```

### Config không thay đổi sau khi sửa .env

```bash
# Generate lại config
npm run config

# Hoặc restart server (sẽ tự động generate)
npm start
```

### Lỗi khi import config

Đảm bảo bạn đã chạy `npm run config` ít nhất một lần để tạo file `src/js/config.js`.

## Ví dụ cho các môi trường khác nhau

### Development
```env
API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
API_TIMEOUT=10000
```

### Staging
```env
API_BASE_URL=https://staging-api.example.com
NODE_ENV=development
API_TIMEOUT=15000
```

### Production
```env
API_BASE_URL=https://api.example.com
NODE_ENV=production
API_TIMEOUT=10000
```

## Best Practices

1. Luôn có file `.env.example` với giá trị mẫu
2. Không commit file `.env`
3. Document các biến môi trường mới
4. Sử dụng giá trị mặc định hợp lý
5. Validate các giá trị quan trọng

