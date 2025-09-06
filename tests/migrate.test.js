const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Migration System Tests', () => {
  const migrationsPath = path.join(__dirname, '..', 'src', 'migrations');
  const dbPath = path.join(__dirname, '..', 'database.sqlite');

  // Helper function to run migration commands
  const runMigrationCommand = (command) => {
    try {
      const result = execSync(`cd ${path.join(__dirname, '..')} && node scripts/migrate.js ${command}`, {
        encoding: 'utf8',
        timeout: 30000
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, output: error.message };
    }
  };

  // Helper function to run npm commands
  const runNpmCommand = (command) => {
    try {
      const result = execSync(`cd ${path.join(__dirname, '..')} && npm run ${command}`, {
        encoding: 'utf8',
        timeout: 30000
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, output: error.message };
    }
  };

  // Helper function to count migration files
  const countMigrationFiles = () => {
    if (!fs.existsSync(migrationsPath)) return 0;
    return fs.readdirSync(migrationsPath).filter(file => file.endsWith('.js')).length;
  };

  // Helper function to get latest migration file
  const getLatestMigrationFile = () => {
    if (!fs.existsSync(migrationsPath)) return null;
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .reverse();
    return files[0] || null;
  };

  // Cleanup after each test
  afterEach(async () => {
    await cleanupTestMigrations();
  });

  // Helper function to cleanup test migrations only
  const cleanupTestMigrations = async () => {
    try {
      // Remove test migration files (created during current test run)
      if (fs.existsSync(migrationsPath)) {
        const files = fs.readdirSync(migrationsPath);
        files.forEach(file => {
          // Only remove files created today (with today's timestamp)
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          if (file.startsWith(today) || file.startsWith('2025090701')) {
            fs.unlinkSync(path.join(migrationsPath, file));
          }
        });
      }
    } catch (error) {
      console.warn('Warning during test migration cleanup:', error.message);
    }
  };

  describe('🔍 Migration Analysis', () => {
    test('should analyze and generate missing migrations', () => {
      const initialCount = countMigrationFiles();
      const result = runMigrationCommand('analyze');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Analyzing models for missing migrations');
      
      const finalCount = countMigrationFiles();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('should list available models', () => {
      const result = runMigrationCommand('list');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Available models:');
      expect(result.output).toContain('User → users');
    });

    test('should show comprehensive status', () => {
      const result = runMigrationCommand('status');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Comprehensive Database Status Report');
      expect(result.output).toContain('MODELS & MIGRATION FILES');
    });
  });

  describe('📝 Migration Creation', () => {
    test('should create table migration', () => {
      const initialCount = countMigrationFiles();
      const result = runMigrationCommand('create:table test_products -c "name:STRING:allowNull=false" "price:DECIMAL"');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Migration created:');
      
      const finalCount = countMigrationFiles();
      expect(finalCount).toBe(initialCount + 1);
      
      const latestFile = getLatestMigrationFile();
      expect(latestFile).toContain('create-test_products');
    });

    test('should create add column migration', () => {
      const initialCount = countMigrationFiles();
      const result = runMigrationCommand('add:column users description "TEXT:allowNull=true"');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Migration created:');
      
      const finalCount = countMigrationFiles();
      expect(finalCount).toBe(initialCount + 1);
      
      const latestFile = getLatestMigrationFile();
      expect(latestFile).toContain('add-description-to-users');
    });
  });

  describe('⚠️ Error Handling', () => {
    test('should handle invalid commands', () => {
      const result = runMigrationCommand('invalid:command');
      
      expect(result.success).toBe(false);
      expect(result.output).toContain('unknown command');
    });

    test('should handle missing parameters', () => {
      const result = runMigrationCommand('add:column');
      
      expect(result.success).toBe(false);
      expect(result.output).toContain('missing required argument');
    });
  });

  describe('🧪 Integration Tests', () => {
    test('should handle complete migration workflow', async () => {
      // 1. Analyze and generate migration
      const analyzeResult = runMigrationCommand('analyze');
      expect(analyzeResult.success).toBe(true);
      
      // 2. Check migration status
      const statusResult = runMigrationCommand('status');
      expect(statusResult.success).toBe(true);
    });
  });
});