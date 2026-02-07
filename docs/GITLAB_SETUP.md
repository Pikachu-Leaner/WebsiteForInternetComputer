# GitLab Setup Guide

## Thiết lập Repository trên GitLab

### 1. Tạo Repository mới trên GitLab

1. Đăng nhập vào GitLab
2. Tạo project mới (New Project → Create blank project)
3. Copy repository URL

### 2. Khởi tạo Git và push code

```bash
# Khởi tạo git repository (nếu chưa có)
git init

# Thêm remote
git remote add origin <repository-url>

# Thêm tất cả files
git add .

# Commit đầu tiên
git commit -m "chore: initial project setup"

# Push lên GitLab
git push -u origin main
```

## GitLab CI/CD

### Cấu hình Variables (nếu cần)

Vào **Settings → CI/CD → Variables** và thêm các biến môi trường nếu cần:

- `API_BASE_URL`: Base URL cho API
- `NODE_VERSION`: Version của Node.js (mặc định: 18)

### Pipeline Stages

Project có 3 stages trong CI/CD:

1. **lint**: Kiểm tra commit message format
2. **build**: Build CSS files
3. **deploy**: Deploy (manual trigger)

### Xem Pipeline

Vào **CI/CD → Pipelines** để xem trạng thái của các pipeline.

## Protected Branches

Khuyến nghị thiết lập protected branches:

1. Vào **Settings → Repository → Protected Branches**
2. Protect branch `main` và `develop`:
   - Allowed to merge: Developers + Maintainers
   - Allowed to push: Maintainers only
   - Allowed to force push: No

## Merge Requests

### Tạo Merge Request

1. Tạo branch mới: `git checkout -b feat/new-feature`
2. Commit changes với format đúng
3. Push branch: `git push origin feat/new-feature`
4. Tạo Merge Request trên GitLab
5. Assign reviewers
6. Merge sau khi được approve

### Merge Request Template (Tùy chọn)

Tạo file `.gitlab/merge_request_templates/default.md`:

```markdown
## Description
<!-- Mô tả về thay đổi -->

## Type of Change
- [ ] feat: Tính năng mới
- [ ] fix: Sửa lỗi
- [ ] docs: Tài liệu
- [ ] style: Format code
- [ ] refactor: Refactor
- [ ] perf: Performance
- [ ] test: Test

## Checklist
- [ ] Code đã được test
- [ ] Đã build CSS nếu có thay đổi
- [ ] Đã cập nhật tài liệu nếu cần
- [ ] Commit message đúng format
```

## CI/CD Best Practices

1. **Chạy tests trước khi merge**: Đảm bảo tất cả tests pass
2. **Build check**: CSS được build thành công
3. **Code review**: Luôn có code review trước khi merge
4. **Small commits**: Commit nhỏ và có ý nghĩa
5. **Clear messages**: Commit message rõ ràng

## Troubleshooting

### Pipeline fails

1. Kiểm tra logs trong GitLab CI/CD
2. Test local trước khi push
3. Đảm bảo Node.js version đúng

### Commit message rejected

1. Kiểm tra format commit message
2. Sử dụng `git commit --amend` để sửa message
3. Xem CONTRIBUTING.md để biết format đúng

