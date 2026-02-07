# Project Structure

Mô tả chi tiết về cấu trúc dự án.

```
js-boilerplate/
│
├── src/                         # Source code chính
│   ├── css/                     # Stylesheet files
│   │   └── custom.css           # Custom CSS styles
│   │
│   ├── js/                      # JavaScript files
│   │   ├── api.js               # API service module (Axios/Fetch)
│   │   └── main.js              # Main JavaScript entry point
│   │
│   ├── assets/                  # Static assets
│   │   └── images/              # Image files
│   │
│   ├── pages/                   # HTML pages
│   │   ├── about.html           # About page
│   │   └── contact.html         # Contact page
│   │
│   └── index.html               # Homepage
│
├── config/                      # Configuration files
│   └── api.config.js            # API configuration
│
├── docs/                        # Documentation
│   ├── CONTRIBUTING.md          # Contributing guide
│   └── GITLAB_SETUP.md          # GitLab setup guide
│
├── .husky/                      # Git hooks (Husky)
│   └── commit-msg               # Commit message hook
│
├── .gitignore                   # Git ignore rules
├── .gitattributes               # Git attributes (line endings)
├── .editorconfig                # Editor configuration
├── .gitlab-ci.yml               # GitLab CI/CD configuration
├── commitlint.config.js         # Commit message linting rules
├── package.json                 # Node.js dependencies & scripts
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick start guide
└── PROJECT_STRUCTURE.md         # This file
```

## Thư mục chính

### `/src`
Thư mục chứa toàn bộ source code của ứng dụng.

#### `/src/css`
- **custom.css**: Custom CSS styles, thêm vào đây các style tùy chỉnh

#### `/src/js`
- **api.js**: Module quản lý tất cả API calls, sử dụng Axios và Fetch
- **main.js**: File JavaScript chính, khởi tạo ứng dụng

#### `/src/pages`
Chứa các HTML pages ngoài homepage.

#### `/src/assets`
Chứa các static assets như images, fonts, etc.

### `/config`
Các file cấu hình cho ứng dụng.

### `/docs`
Tài liệu và hướng dẫn.

### `/.husky`
Git hooks được quản lý bởi Husky.

## File cấu hình

### `package.json`
Định nghĩa dependencies và scripts của project.

### `commitlint.config.js`
Rules cho commit message format (Conventional Commits).

### `.gitlab-ci.yml`
GitLab CI/CD pipeline configuration.

### `.editorconfig`
Editor configuration để đảm bảo consistent coding style.

### `.gitignore`
Files và folders sẽ bị Git ignore.

### `.gitattributes`
Git attributes để quản lý line endings.

## Workflow

### Development
1. Làm việc trong `/src`
2. Chạy `npm run dev` để start server
3. Test trên `http://localhost:3000`

### Commit
1. Format commit message theo Conventional Commits
2. Husky sẽ validate commit message tự động
3. Push và tạo Merge Request trên GitLab

## Best Practices

### File Organization
- Giữ structure rõ ràng và nhất quán
- Đặt files liên quan gần nhau
- Sử dụng tên file mô tả rõ ràng

### Naming Conventions
- HTML: `kebab-case.html`
- CSS: `kebab-case.css`
- JavaScript: `camelCase.js` hoặc `kebab-case.js`

### Path Management
- Sử dụng relative paths trong HTML
- Đảm bảo paths đúng khi files ở subdirectories
- Test navigation giữa các pages

## Thêm components mới

### Thêm page mới
1. Tạo file HTML trong `/src/pages/`
2. Copy structure từ page có sẵn
3. Update navigation trong tất cả pages

### Thêm CSS module mới
1. Tạo file CSS trong `/src/css/`
2. Import vào HTML: `<link rel="stylesheet" href="path/to/file.css">`
3. Hoặc thêm vào `custom.css` nếu styles nhỏ

### Thêm JavaScript module mới
1. Tạo file JS trong `/src/js/`
2. Import vào file cần dùng: `import Module from './module.js'`
3. Export functions/classes cần thiết

### Thêm API endpoint
1. Thêm vào `config/api.config.js`
2. Sử dụng trong `src/js/api.js` hoặc tạo service riêng
3. Test với mock data hoặc real API

