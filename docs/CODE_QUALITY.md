# Code Quality Guide

Hướng dẫn về code quality tools và cách sử dụng Prettier và ESLint.

## Tools

### Prettier

**Prettier** là code formatter tự động, giúp format code theo chuẩn nhất quán.

- Format: JavaScript, HTML, CSS, JSON
- Cấu hình: `.prettierrc.json`
- Ignore files: `.prettierignore`

### ESLint

**ESLint** là linter để phát hiện lỗi code và code smell.

- Lint: JavaScript
- Cấu hình: `.eslintrc.js`
- Ignore files: `.eslintignore`

## Cài đặt

Dependencies đã được cài đặt trong `package.json`:

```bash
npm install
```

## Sử dụng

### Format code với Prettier

Format tất cả files:

```bash
npm run format
```

Kiểm tra format (không sửa):

```bash
npm run format:check
```

### Lint code với ESLint

Kiểm tra lỗi:

```bash
npm run lint
```

Tự động sửa các lỗi có thể fix:

```bash
npm run lint:fix
```

### Check tất cả (lint + format)

```bash
npm run check
```

## Pre-commit (Tùy chọn)

Để tự động format và lint trước khi commit, bạn có thể thêm pre-commit hook:

1. Thêm vào `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run check
```

2. Hoặc chỉ format:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run format
```

## Cấu hình Prettier

File `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

### Các options chính:

- `semi`: Thêm semicolon (`true`)
- `singleQuote`: Sử dụng single quotes (`true`)
- `tabWidth`: Số spaces cho indentation (`2`)
- `printWidth`: Độ rộng dòng (`100`)
- `trailingComma`: Trailing comma (`"es5"`)

Xem thêm: https://prettier.io/docs/en/options.html

## Cấu hình ESLint

File `.eslintrc.js` đã được cấu hình với:

### Rules chính:

#### Code Quality:
- `no-console`: Cảnh báo khi dùng console (cho phép warn, error)
- `no-debugger`: Lỗi khi dùng debugger
- `no-var`: Lỗi khi dùng var (phải dùng const/let)
- `prefer-const`: Ưu tiên const khi biến không thay đổi

#### Code Smell Detection:
- `no-unused-vars`: Cảnh báo biến không dùng
- `no-shadow`: Cảnh báo shadowing
- `no-unreachable`: Lỗi code không thể chạy tới
- `no-else-return`: Cảnh báo else sau return

#### Best Practices:
- `eqeqeq`: Bắt buộc dùng === và !==
- `curly`: Bắt buộc dùng {} cho if/else
- `no-eval`: Cấm eval()
- `no-implied-eval`: Cấm implied eval

Xem thêm: https://eslint.org/docs/rules/

## GitLab CI/CD

GitLab CI đã được cấu hình để chạy:

1. **lint:js** - ESLint check
2. **lint:format** - Prettier format check
3. **lint:commit** - Commit message format check

Tất cả checks phải pass trước khi merge (trừ lint:commit có thể fail).

## VSCode Integration

### Setup VSCode để tự động format

1. Cài đặt extensions:
   - Prettier - Code formatter
   - ESLint

2. Thêm vào `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Workflow khuyến nghị

### Khi code mới:

1. Viết code
2. Format: `npm run format`
3. Lint: `npm run lint` (sửa lỗi nếu có)
4. Commit

### Trước khi push:

```bash
npm run check
```

### Trong CI/CD:

GitLab CI sẽ tự động chạy checks khi có merge request.

## Troubleshooting

### Prettier conflicts với ESLint

Prettier và ESLint đã được cấu hình để không conflict. Nếu có conflict:

1. Prettier xử lý formatting (spaces, quotes, semicolons)
2. ESLint xử lý code quality (logic, best practices)

### ESLint báo lỗi nhưng code đúng

Kiểm tra `.eslintrc.js` và điều chỉnh rules nếu cần. Hoặc disable rule cho dòng cụ thể:

```javascript
// eslint-disable-next-line no-console
console.log('Debug info');
```

### Format không hoạt động

1. Kiểm tra `.prettierignore` không ignore file đó
2. Kiểm tra Prettier extension đã cài trong VSCode
3. Chạy thủ công: `npm run format`

## Best Practices

1. ✅ Format code trước khi commit
2. ✅ Sửa tất cả ESLint errors
3. ✅ Chạy `npm run check` trước khi push
4. ✅ Không disable ESLint rules trừ khi thực sự cần
5. ✅ Giữ code format nhất quán trong team

## Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [ESLint Rules](https://eslint.org/docs/rules/)

