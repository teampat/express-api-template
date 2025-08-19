const fs = require('fs');
const path = require('path');

console.log('📁 Express.js API Template Project Structure\n');

function printDirectoryTree(dirPath, prefix = '', maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) return;

  try {
    const items = fs.readdirSync(dirPath).filter(item => {
      // Filter out common unnecessary directories/files
      return (
        !item.startsWith('.') &&
        item !== 'node_modules' &&
        item !== 'logs' &&
        item !== 'uploads' &&
        item !== 'coverage' &&
        item !== 'database.sqlite' &&
        item !== 'test-api.js' &&
        item !== 'project-structure.js'
      );
    });

    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const isLast = index === items.length - 1;
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';

      console.log(prefix + currentPrefix + item);

      if (fs.statSync(itemPath).isDirectory()) {
        printDirectoryTree(itemPath, prefix + nextPrefix, maxDepth, currentDepth + 1);
      }
    });
  } catch (error) {
    console.log(prefix + '└── [Error reading directory]');
  }
}

printDirectoryTree('.');

console.log('\n📚 Key Directories and Files:');
console.log('');
console.log('🔧 Configuration:');
console.log('  ├── .env                 - Environment variables');
console.log('  ├── .env.example         - Environment variables template');
console.log('  ├── package.json         - Project dependencies and scripts');
console.log('  └── .sequelizerc         - Sequelize CLI configuration');
console.log('');
console.log('📡 API Core:');
console.log('  ├── src/server.js        - Main application entry point');
console.log('  ├── src/config/          - Configuration files (database, logger, swagger)');
console.log('  ├── src/middleware/      - Express middleware (auth, validation, error handling)');
console.log('  ├── src/models/          - Database models (Sequelize)');
console.log('  ├── src/routes/          - API route definitions');
console.log('  ├── src/services/        - Business logic services');
console.log('  └── src/validators/      - Request validation schemas (Joi)');
console.log('');
console.log('🗄️ Database:');
console.log('  ├── src/migrations/      - Database schema migrations');
console.log('  ├── src/seeders/         - Database seed data');
console.log('  └── database.sqlite      - SQLite database file (created at runtime)');
console.log('');
console.log('🧪 Testing:');
console.log('  ├── tests/               - Test files (Jest + Supertest)');
console.log('  ├── coverage/            - Test coverage reports (generated)');
console.log('  └── test-api.js          - Quick API test script');
console.log('');
console.log('📋 Documentation:');
console.log('  ├── README.md            - Project documentation');
console.log('  ├── GETTING_STARTED.md   - Quick start guide');
console.log('  └── .github/             - GitHub specific files (Copilot instructions)');
console.log('');
console.log('🚀 Quick Commands:');
console.log('  ├── npm run dev          - Start development server with auto-reload');
console.log('  ├── npm start            - Start production server');
console.log('  ├── npm test             - Run test suite');
console.log('  ├── npm run migrate      - Run database migrations');
console.log('  └── npm run seed         - Seed database with sample data');
console.log('');
console.log('🌐 Access Points:');
console.log('  ├── http://localhost:3000/health      - Health check endpoint');
console.log('  ├── http://localhost:3000/api-docs    - Interactive API documentation');
console.log('  └── http://localhost:3000/api/        - API endpoints base path');
console.log('');
