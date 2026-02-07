# Troubleshooting Guide

Hướng dẫn xử lý các lỗi thường gặp.

## Port 3000 đã được sử dụng

### Lỗi:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

### Giải pháp:

#### Windows (PowerShell):

1. Tìm process đang sử dụng port 3000:
```powershell
netstat -ano | findstr :3000
```

2. Kill process (thay `PID` bằng số process ID từ bước 1):
```powershell
taskkill /F /PID <PID>
```

Ví dụ:
```powershell
taskkill /F /PID 19780
```

#### Windows (Command Prompt):

```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

#### Linux/Mac:

1. Tìm process:
```bash
lsof -i :3000
```

2. Kill process:
```bash
kill -9 <PID>
```

### Giải pháp khác:

Thay đổi port trong `package.json`:

```json
{
  "scripts": {
    "dev": "http-server src -p 3001 -o"
  }
}
```

Sau đó chạy `npm start` (sẽ chạy trên port 3001).

## Lỗi khi cài đặt dependencies

### Lỗi:
```
npm ERR! code ...
```

### Giải pháp:

1. Xóa node_modules và package-lock.json:
```bash
# Windows
rmdir /s /q node_modules
del package-lock.json

# Linux/Mac
rm -rf node_modules package-lock.json
```

2. Cài đặt lại:
```bash
npm install
```

## ESLint/Prettier lỗi

### Lỗi format:

```bash
npm run format
```

### Lỗi lint:

```bash
npm run lint:fix
```

### Kiểm tra tất cả:

```bash
npm run check
```

## Config không được generate

### Lỗi:
```
Cannot find module 'dotenv'
```

### Giải pháp:

1. Cài đặt dependencies:
```bash
npm install
```

2. Generate config:
```bash
npm run config
```

## Git hooks không hoạt động

### Giải pháp:

```bash
npm run prepare
```

## Module không tìm thấy trong browser

### Lỗi:
```
Uncaught TypeError: Failed to resolve module specifier
```

### Giải pháp:

1. Đảm bảo đang chạy qua http-server (không phải file://)
2. Đảm bảo file có extension `.js` khi import
3. Kiểm tra paths trong HTML files

## API calls không hoạt động

### Kiểm tra:

1. Đảm bảo `src/js/config.js` đã được generate:
```bash
npm run config
```

2. Kiểm tra file `.env` có giá trị đúng:
```env
API_BASE_URL=http://localhost:3000/api
```

3. Kiểm tra browser console để xem lỗi chi tiết

## GitLab CI/CD fails

### Lỗi lint:

Kiểm tra code quality:
```bash
npm run check
```

### Lỗi commit message:

Sử dụng format đúng:
```bash
git commit -m "feat(scope): description"
```

Xem `docs/CONTRIBUTING.md` để biết format chi tiết.

## Browser không load trang

### Kiểm tra:

1. Server đang chạy:
```bash
npm start
```

2. Truy cập đúng URL:
```
http://localhost:3000
```

3. Kiểm tra console trong browser (F12)

## Import errors

### Lỗi:
```
Cannot use import statement outside a module
```

### Giải pháp:

1. Đảm bảo script tag có `type="module"`:
```html
<script type="module" src="./js/main.js"></script>
```

2. Đảm bảo file có extension `.js`

## Performance issues

### Nếu trang load chậm:

1. Kiểm tra network tab trong browser DevTools
2. Kiểm tra số lượng requests
3. Kiểm tra file sizes

## Cache issues

### Xóa cache:

1. Browser: Ctrl+Shift+Delete (hoặc Cmd+Shift+Delete trên Mac)
2. Hard reload: Ctrl+Shift+R (hoặc Cmd+Shift+R)

## Khác

Nếu gặp lỗi khác:

1. Kiểm tra console trong browser (F12)
2. Kiểm tra terminal output
3. Xem documentation liên quan
4. Tạo issue trên GitLab với thông tin chi tiết

