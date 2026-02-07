# Hướng dẫn thiết lập dự án

## Bước 1: Cài đặt Node.js

Đảm bảo bạn đã cài đặt Node.js >= 16.0.0

Kiểm tra version:
```bash
node --version
npm --version
```

## Bước 2: Clone và cài đặt dependencies

```bash
# Clone repository (nếu từ GitLab)
git clone <repository-url>
cd js-boilerplate

# Hoặc nếu đã có code, chỉ cần:
cd js-boilerplate

# Cài đặt dependencies
npm install
```

## Bước 3: Thiết lập Git hooks (Husky)

Sau khi `npm install`, Husky sẽ tự động được setup. Nếu cần setup thủ công:

```bash
npm run prepare
```

Điều này sẽ cài đặt Git hooks để validate commit messages.

## Bước 4: Chạy development server

```bash
npm start
# hoặc
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

Mở trình duyệt và truy cập địa chỉ trên.

## Bước 5: Thiết lập GitLab (nếu chưa có)

1. Tạo repository mới trên GitLab
2. Thêm remote:
   ```bash
   git remote add origin <repository-url>
   ```
3. Push code:
   ```bash
   git add .
   git commit -m "chore: initial project setup"
   git push -u origin main
   ```

Xem `docs/GITLAB_SETUP.md` để biết thêm chi tiết.


## Kiểm tra setup

1. Dependencies đã được cài đặt: `node_modules/` tồn tại
2. Server chạy được: Truy cập `http://localhost:3000` thành công
3. Git hooks hoạt động: Thử commit với message sai format để test

## Troubleshooting

### Lỗi khi cài đặt dependencies

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 đã được sử dụng

**Lỗi:** `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000`

**Giải pháp:**

1. Tìm và kill process:
```powershell
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

2. Hoặc thay đổi port trong `package.json`:
```json
"dev": "http-server src -p 3001 -o"
```

Xem `docs/TROUBLESHOOTING.md` để biết thêm chi tiết.

### Git hooks không hoạt động

```bash
# Setup lại Husky
npm run prepare

# Kiểm tra .husky/commit-msg có tồn tại không
```

## Bắt đầu phát triển

Sau khi setup xong, bạn có thể:

1. Sửa code trong `/src`
2. Xem thay đổi tại `http://localhost:3000`
3. Commit code với format đúng (xem `docs/CONTRIBUTING.md`)
4. Push và tạo Merge Request trên GitLab

Xem `QUICKSTART.md` để biết hướng dẫn nhanh.

## Tài liệu tham khảo

- `README.md` - Tài liệu chính
- `QUICKSTART.md` - Hướng dẫn nhanh
- `PROJECT_STRUCTURE.md` - Cấu trúc dự án
- `docs/ENV_CONFIG.md` - Hướng dẫn cấu hình biến môi trường
- `docs/CONTRIBUTING.md` - Quy tắc commit
- `docs/GITLAB_SETUP.md` - Thiết lập GitLab

