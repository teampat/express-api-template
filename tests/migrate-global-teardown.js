const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const projectRoot = path.join(__dirname, '..');
  const migrationsPath = path.join(projectRoot, 'src', 'migrations');
  const dbPath = path.join(projectRoot, 'database.sqlite');
  const backupPath = path.join(__dirname, '.test-backup');

  console.log('🧹 Starting migration test cleanup...');

  try {
    // Remove test database
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Removed test database');
    }

    // Remove all test migration files (files created during testing)
    if (fs.existsSync(migrationsPath)) {
      const files = fs.readdirSync(migrationsPath);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          // Remove files that were created during testing (with today's timestamp)
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          if (file.startsWith(today) || file.startsWith('2025090701')) {
            fs.unlinkSync(path.join(migrationsPath, file));
            console.log(`✅ Removed test migration: ${file}`);
          }
        }
      });
    }

    // Restore original migrations from backup
    if (fs.existsSync(backupPath)) {
      const backupFiles = fs.readdirSync(backupPath);
      
      backupFiles.forEach(file => {
        if (file.endsWith('.js')) {
          const srcPath = path.join(backupPath, file);
          const destPath = path.join(migrationsPath, file);
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ Restored original migration: ${file}`);
        }
      });

      // Restore original database if it existed
      const backupDbPath = path.join(backupPath, 'database.sqlite');
      if (fs.existsSync(backupDbPath)) {
        fs.copyFileSync(backupDbPath, dbPath);
        console.log('✅ Restored original database');
      }

      // Remove backup directory
      fs.rmSync(backupPath, { recursive: true, force: true });
      console.log('✅ Removed backup directory');
    }

    // Remove any test model files
    const modelsPath = path.join(projectRoot, 'src', 'models');
    if (fs.existsSync(modelsPath)) {
      const files = fs.readdirSync(modelsPath);
      files.forEach(file => {
        if (file.startsWith('Test') && file.endsWith('.js')) {
          fs.unlinkSync(path.join(modelsPath, file));
          console.log(`✅ Removed test model: ${file}`);
        }
      });
    }

    console.log('🎉 Migration test cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration test cleanup:', error.message);
    
    // Attempt basic cleanup even if backup restoration fails
    try {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
      
      if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true, force: true });
      }
      
      console.log('⚠️ Basic cleanup completed despite errors');
    } catch (basicCleanupError) {
      console.error('❌ Basic cleanup also failed:', basicCleanupError.message);
    }
  }

  // Reset environment
  delete process.env.NODE_ENV;
};
