# Contributing Guide

## Quy tắc Commit Code

### 1. Commit Message Format

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Types (Bắt buộc)

- **feat**: Tính năng mới
- **fix**: Sửa lỗi
- **docs**: Thay đổi tài liệu
- **style**: Thay đổi format code (không ảnh hưởng logic)
- **refactor**: Refactor code (không thêm tính năng, không sửa lỗi)
- **perf**: Cải thiện performance
- **test**: Thêm hoặc sửa test
- **build**: Thay đổi build system hoặc dependencies
- **ci**: Thay đổi CI/CD configuration
- **chore**: Các thay đổi khác (không thuộc các loại trên)
- **revert**: Revert một commit trước đó

### 3. Scope (Tùy chọn)

Phạm vi thay đổi, ví dụ:
- `auth`: Authentication
- `api`: API service
- `ui`: User interface
- `css`: Stylesheet
- `config`: Configuration

### 4. Subject (Bắt buộc)

- Mô tả ngắn gọn về thay đổi
- Bắt đầu bằng chữ thường
- Không kết thúc bằng dấu chấm (.)
- Tối đa 50 ký tự (khuyến nghị)

### 5. Body (Tùy chọn)

- Giải thích chi tiết hơn về thay đổi
- So sánh với code cũ nếu cần
- Cách sử dụng tính năng mới
- Separated từ subject bằng một dòng trống

### 6. Footer (Tùy chọn)

- Breaking changes (bắt đầu với `BREAKING CHANGE:`)
- Issue references (ví dụ: `Closes #123`)

## Ví dụ Commit Messages

### ✅ Đúng format:

```bash
feat(auth): thêm chức năng đăng nhập với OAuth

Implement OAuth2 authentication flow
- Google login
- Facebook login
- Token management

Closes #45
```

```bash
fix(api): sửa lỗi timeout khi call API lâu

Tăng timeout từ 5s lên 10s và thêm retry logic
```

```bash
docs(readme): cập nhật hướng dẫn cài đặt
```

```bash
style(css): format lại CSS code theo chuẩn
```

```bash
refactor(api): tái cấu trúc API service module

- Tách interceptor ra file riêng
- Thêm error handling tốt hơn
```

### ❌ Sai format:

```bash
# Thiếu type
Thêm tính năng mới

# Thiếu subject
feat:

# Subject quá dài
feat(auth): thêm chức năng đăng nhập với OAuth và social login và nhiều tính năng khác

# Kết thúc bằng dấu chấm
feat(auth): thêm chức năng đăng nhập.

# Viết hoa chữ cái đầu
feat(auth): Thêm chức năng đăng nhập
```

## Workflow

### 1. Tạo branch mới

```bash
git checkout -b feat/new-feature
# hoặc
git checkout -b fix/bug-fix
```

### 2. Thực hiện thay đổi

- Code changes
- Test local
- Build CSS nếu có thay đổi CSS: `npm run build:css`

### 3. Commit

```bash
git add .
git commit -m "feat(scope): subject"
```

Commit message sẽ được kiểm tra tự động bởi commitlint.

### 4. Push và tạo Merge Request

```bash
git push origin feat/new-feature
```

Tạo Merge Request trên GitLab.

## Linting và Validation

### Commit Message Linting

Commit message được kiểm tra tự động bằng commitlint khi commit:

```bash
git commit -m "your message"
# Commitlint sẽ kiểm tra format
```

### Pre-commit Hooks

Husky được cấu hình để chạy commitlint trước khi commit được chấp nhận.

## Code Style

### HTML

- Sử dụng 2 spaces cho indentation
- Đóng tất cả tags
- Sử dụng semantic HTML5 elements

### CSS

- Sử dụng 2 spaces cho indentation
- Follow Bootstrap conventions
- Custom CSS nên được đặt trong `src/css/custom.css`

### JavaScript

- Sử dụng ES6+ syntax
- Sử dụng `const` và `let`, tránh `var`
- Sử dụng arrow functions khi phù hợp
- Comment cho các function phức tạp

### File Naming

- HTML: `kebab-case.html` (ví dụ: `about-us.html`)
- CSS: `kebab-case.css` (ví dụ: `custom-styles.css`)
- JavaScript: `camelCase.js` hoặc `kebab-case.js` (ví dụ: `apiService.js` hoặc `api-service.js`)

## Testing

Trước khi commit:

1. Code hoạt động trên localhost
2. Build CSS thành công: `npm run build:css`
3. Không có lỗi console
4. Test trên các browser khác nhau (nếu có thể)

## Questions?

Nếu có câu hỏi về quy trình, vui lòng tạo issue trên GitLab.

