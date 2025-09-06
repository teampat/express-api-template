const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Store original state before tests
  const projectRoot = path.join(__dirname, '..');
  const migrationsPath = path.join(projectRoot, 'src', 'migrations');
  const dbPath = path.join(projectRoot, 'database.sqlite');
  
  // Create backup directory for original files
  const backupPath = path.join(__dirname, '.test-backup');
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  // Backup original migrations if they exist
  if (fs.existsSync(migrationsPath)) {
    const migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.js'));
    migrationFiles.forEach(file => {
      const srcPath = path.join(migrationsPath, file);
      const destPath = path.join(backupPath, file);
      fs.copyFileSync(srcPath, destPath);
    });
  }

  // Backup original database if it exists
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, path.join(backupPath, 'database.sqlite'));
  }

  // Clean environment for testing
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Clean existing migrations (will restore later)
  if (fs.existsSync(migrationsPath)) {
    const files = fs.readdirSync(migrationsPath);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        fs.unlinkSync(path.join(migrationsPath, file));
      }
    });
  }

  // Set test environment
  process.env.NODE_ENV = 'test';
  
  console.log('🧪 Migration test environment setup complete');
};
