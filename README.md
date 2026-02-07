# JS Boilerplate

Boilerplate project cho website sử dụng HTML, CSS, Bootstrap và API calls với Axios/Fetch.

## 🚀 Công nghệ sử dụng

- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling
- **Bootstrap 5.3.2** - CSS Framework
- **JavaScript (ES6+)** - Logic và tương tác
- **Axios** - HTTP Client cho API calls
- **Fetch API** - Native API cho HTTP requests
- **Node.js** - Development environment

## 📁 Cấu trúc dự án

```
js-boilerplate/
├── src/                    # Source code chính
│   ├── css/               # CSS files
│   │   └── custom.css    # Custom CSS styles
│   ├── js/               # JavaScript files
│   │   ├── api.js        # API service module
│   │   └── main.js       # Main JavaScript file
│   ├── assets/           # Static assets
│   │   └── images/       # Image files
│   ├── pages/            # HTML pages
│   │   ├── about.html
│   │   └── contact.html
│   └── index.html        # Homepage
├── config/               # Configuration files
├── docs/                 # Documentation
├── husky/                # Git hooks
├── .gitignore
├── .gitlab-ci.yml        # GitLab CI/CD config
├── .editorconfig         # Editor configuration
├── commitlint.config.js  # Commit message rules
└── package.json
```

## 🛠️ Cài đặt

### Yêu cầu

- Node.js >= 16.0.0
- npm >= 8.0.0

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd js-boilerplate
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy development server

```bash
npm run dev
# hoặc
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📝 Scripts có sẵn

- `npm run dev` / `npm start` - Chạy development server trên localhost:3000 (tự động generate config trước)
- `npm run config` - Generate file config từ .env
- `npm run lint` - Kiểm tra code với ESLint
- `npm run lint:fix` - Tự động sửa các lỗi ESLint có thể fix
- `npm run format` - Format code với Prettier
- `npm run format:check` - Kiểm tra format code (không sửa)
- `npm run check` - Chạy cả lint và format check
- `npm run lint:commit` - Kiểm tra commit message format

## 🎨 Sử dụng Bootstrap

Dự án sử dụng Bootstrap 5.3.2 cho layout và components.

- **Bootstrap**: Sử dụng cho layout grid, components (buttons, cards, navbar, ...)
- **Custom CSS**: Thêm vào `src/css/custom.css` cho các style tùy chỉnh

### Ví dụ:

```html
<!-- Bootstrap Container và Grid -->
<div class="container">
  <div class="row">
    <div class="col-md-6">
      <button class="btn btn-primary">Bootstrap Button</button>
    </div>
  </div>
</div>

<!-- Bootstrap Card -->
<div class="card shadow-sm">
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p class="card-text">Card content</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
```

## 🔌 Sử dụng API Service

### Với Axios (Khuyến nghị)

```javascript
import ApiService from './js/api.js';

// GET request
const data = await ApiService.get('/users', { page: 1 });

// POST request
const result = await ApiService.post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await ApiService.put('/users/1', { name: 'Jane' });

// DELETE request
await ApiService.delete('/users/1');
```

### Với Fetch API

```javascript
import { FetchService } from './js/api.js';

// GET request
const data = await FetchService.get('/users', { page: 1 });

// POST request
const result = await FetchService.post('/users', { name: 'John' });
```

### Hoặc sử dụng Fetch API trực tiếp

```javascript
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## 📋 Git Commit Rules

Dự án sử dụng [Conventional Commits](https://www.conventionalcommits.org/) format.

### Format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types:

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Tài liệu
- `style`: Format code, không ảnh hưởng logic
- `refactor`: Refactor code
- `perf`: Cải thiện performance
- `test`: Thêm/sửa test
- `build`: Build system, dependencies
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert commit

### Ví dụ:

```bash
feat(auth): thêm chức năng đăng nhập
fix(api): sửa lỗi timeout khi call API
docs(readme): cập nhật hướng dẫn cài đặt
style(css): format lại CSS code
refactor(api): tái cấu trúc API service module
```

### Commit sẽ bị reject nếu:

- Không đúng format
- Thiếu type hoặc subject
- Subject quá dài (>100 ký tự)

## 🔄 GitLab CI/CD

Project có cấu hình GitLab CI/CD với các stages:

1. **lint**: Kiểm tra commit message format
2. **deploy**: Deploy (manual trigger)

Xem chi tiết trong `.gitlab-ci.yml`

## 🌐 Localhost Development

Project được thiết kế để chạy chủ yếu trên localhost:

1. Chạy `npm run dev` để start server
2. Truy cập `http://localhost:3000`
3. File changes sẽ được reload tự động (với http-server)

### Troubleshooting

Nếu gặp lỗi "port 3000 đã được sử dụng", xem [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) để biết cách xử lý.

## 📚 Tài liệu tham khảo

- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)

## 📄 License

MIT

## 👥 Contributing

Khi commit code, vui lòng tuân thủ quy tắc commit message đã được định nghĩa. Xem phần "Git Commit Rules" ở trên.

