# Quick Start Guide

Hướng dẫn nhanh để bắt đầu với project.

## Bắt đầu nhanh (5 phút)

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường (Tùy chọn)

```bash
# Copy .env.example thành .env
Copy-Item .env.example .env  # Windows
# hoặc
cp .env.example .env  # Linux/Mac

# Chỉnh sửa .env với giá trị thực tế
# Sau đó generate config
npm run config
```

### 3. Chạy development server

```bash
npm start
```

Mở trình duyệt tại: `http://localhost:3000`

## Làm việc hàng ngày

### Development

```bash
# Chạy server
npm run dev
```

### Commit code

```bash
# Thêm files
git add .

# Commit với message đúng format
git commit -m "feat(scope): description"

# Push
git push
```

**Lưu ý**: Commit message phải tuân theo [Conventional Commits](https://www.conventionalcommits.org/) format.

## Thêm CSS mới

Thêm custom CSS vào `src/css/custom.css` hoặc tạo file CSS mới và link vào HTML.

## 🔌 Thêm API call mới

### Với Axios (khuyến nghị)

```javascript
import ApiService from './js/api.js';

// GET
const users = await ApiService.get('/users');

// POST
const newUser = await ApiService.post('/users', { name: 'John' });
```

Xem `src/js/api.js` để biết thêm chi tiết.

## Thêm page mới

1. Tạo file HTML trong `src/pages/`
2. Copy structure từ `src/pages/about.html`
3. Update navigation trong các files HTML

## Checklist trước khi commit

- [ ] Code hoạt động trên localhost
- [ ] Không có lỗi console
- [ ] Commit message đúng format
- [ ] Đã test trên trình duyệt

### Server không chạy (Port 3000 đã được sử dụng)

**Lỗi:** `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000`

**Giải pháp:**

1. Tìm process đang sử dụng port:
```powershell
netstat -ano | findstr :3000
```

2. Kill process (thay `<PID>` bằng số từ bước 1):
```powershell
taskkill /F /PID <PID>
```

Hoặc thay đổi port trong `package.json`:
```json
"dev": "http-server src -p 3001 -o"
```

Xem thêm: `docs/TROUBLESHOOTING.md`

### Commit bị reject

Kiểm tra format commit message. Ví dụ đúng:
```bash
git commit -m "feat(auth): thêm chức năng đăng nhập"
```

Xem `docs/CONTRIBUTING.md` để biết thêm về commit rules.

## Tài liệu đầy đủ

- `README.md` - Tài liệu chính
- `docs/CONTRIBUTING.md` - Quy tắc commit và contributing
- `docs/GITLAB_SETUP.md` - Thiết lập GitLab

