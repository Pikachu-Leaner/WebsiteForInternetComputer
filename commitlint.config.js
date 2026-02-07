module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Tính năng mới
        'fix',      // Sửa lỗi
        'docs',     // Tài liệu
        'style',    // Format code, không ảnh hưởng logic
        'refactor', // Refactor code
        'perf',     // Cải thiện performance
        'test',     // Thêm/sửa test
        'build',    // Build system, dependencies
        'ci',       // CI/CD changes
        'chore',    // Other changes
        'revert',   // Revert commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};

