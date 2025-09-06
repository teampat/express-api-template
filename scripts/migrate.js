#!/usr/bin/env node

const { program } = require('commander');
const MigrationGenerator = require('../src/utils/migrationGenerator');
const { DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * Smart Migration Generator
 * Analyzes existing models and generates appropriate migrations
 */
class SmartMigrationGenerator {
  constructor() {
    this.generator = new MigrationGenerator();
    this.modelsPath = path.resolve(__dirname, '..', 'src', 'models');
    this.migrationsPath = path.resolve(__dirname, '..', 'src', 'migrations');
  }

  /**
   * Get all model files
   * @returns {Array} Array of model file paths
   */
  getModelFiles() {
    try {
      const files = fs.readdirSync(this.modelsPath);
      return files
        .filter(file => file.endsWith('.js') && file !== 'index.js')
        .map(file => path.join(this.modelsPath, file));
    } catch (error) {
      console.error('Error reading models directory:', error.message);
      return [];
    }
  }

  /**
   * Get existing migration files
   * @returns {Array} Array of migration file names
   */
  getExistingMigrations() {
    try {
      if (!fs.existsSync(this.migrationsPath)) {
        return [];
      }
      const files = fs.readdirSync(this.migrationsPath);
      return files.filter(file => file.endsWith('.js'));
    } catch (error) {
      console.error('Error reading migrations directory:', error.message);
      return [];
    }
  }

  /**
   * Check if migration exists for a table
   * @param {string} tableName Table name to check
   * @returns {boolean} True if migration exists
   */
  migrationExists(tableName) {
    const migrations = this.getExistingMigrations();
    return migrations.some(migration => 
      migration.includes(`create-${tableName.toLowerCase()}`) ||
      migration.includes(`create_${tableName.toLowerCase()}`)
    );
  }

  /**
   * Infer table name from model name
   * @param {string} modelName Model name
   * @returns {string} Table name
   */
  inferTableName(modelName) {
    // Convert PascalCase to snake_case and pluralize
    const snakeCase = modelName
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    
    // Simple pluralization
    if (snakeCase.endsWith('y')) {
      return snakeCase.slice(0, -1) + 'ies';
    } else if (snakeCase.endsWith('s')) {
      return snakeCase + 'es';
    } else {
      return snakeCase + 's';
    }
  }

  /**
   * Generate migrations for all models that don't have them
   */
  async generateMissingMigrations() {
    console.log('🔍 Analyzing models for missing migrations...\n');
    
    const modelFiles = this.getModelFiles();
    const generatedMigrations = [];

    for (const modelFile of modelFiles) {
      try {
        // Get model name from file
        const modelName = path.basename(modelFile, '.js');
        const tableName = this.inferTableName(modelName);
        
        if (!this.migrationExists(tableName)) {
          console.log(`📝 Generating migration for ${modelName} model...`);
          
          // Read and analyze the model file
          const modelDefinition = await this.analyzeModelFile(modelFile);
          
          if (modelDefinition) {
            const migration = this.generator.generateCreateTableMigration(
              tableName,
              modelDefinition.attributes,
              modelDefinition.options
            );
            
            this.generator.writeMigrationFile(migration.fileName, migration.content);
            generatedMigrations.push({
              model: modelName,
              table: tableName,
              file: migration.fileName
            });
          }
        } else {
          console.log(`✅ Migration already exists for ${modelName}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${modelFile}:`, error.message);
      }
    }

    if (generatedMigrations.length > 0) {
      console.log('\n🎉 Generated migrations:');
      generatedMigrations.forEach(({ model, table, file }) => {
        console.log(`   - ${model} → ${table} (${file})`);
      });
      console.log(`\n📁 Total: ${generatedMigrations.length} migrations created`);
    } else {
      console.log('\n✨ All models already have migrations!');
    }

    return generatedMigrations;
  }

  /**
   * Analyze model file to extract attributes
   * @param {string} modelFile Path to model file
   * @returns {Object} Model definition with attributes and options
   */
  async analyzeModelFile(modelFile) {
    try {
      const content = fs.readFileSync(modelFile, 'utf8');
      
      // Parse model definition - improved regex to handle nested objects
      const defineMatch = content.match(/\.define\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[\s\S]*?\})\s*,?\s*(\{[\s\S]*?\})?\s*\)/);
      if (!defineMatch) {
        console.warn(`⚠️  Could not parse model definition in ${modelFile}`);
        return null;
      }

      const modelName = defineMatch[1];
      const attributesString = defineMatch[2];
      const optionsString = defineMatch[3] || '{}';

      // Parse model options
      let options = { timestamps: true };

      if (optionsString && optionsString !== '{}') {
        // Check for timestamps option
        const timestampsMatch = optionsString.match(/timestamps\s*:\s*(true|false)/);
        if (timestampsMatch) {
          options.timestamps = timestampsMatch[1] === 'true';
        }
      }

      // Parse attributes using a more robust approach
      const attributes = this.parseAttributes(attributesString);

      return {
        name: modelName,
        attributes,
        options
      };
    } catch (error) {
      console.error(`Error analyzing model file ${modelFile}:`, error.message);
      return null;
    }
  }

  /**
   * Parse attributes from model definition string
   * @param {string} attributesString Attributes definition string
   * @returns {Object} Parsed attributes
   */
  parseAttributes(attributesString) {
    const attributes = {};
    
    // Remove outer braces
    const content = attributesString.replace(/^\s*\{\s*/, '').replace(/\s*\}\s*$/, '');
    
    // Split by commas that are not inside braces
    const attributeParts = this.splitByTopLevelCommas(content);
    
    attributeParts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      // Extract attribute name and definition
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) return;
      
      const attributeName = trimmed.substring(0, colonIndex).trim();
      const attributeDefinition = trimmed.substring(colonIndex + 1).trim();
      
      // Skip if it looks like a method or function
      if (attributeDefinition.includes('function') || attributeDefinition.includes('=>')) {
        return;
      }
      
      // Parse the attribute definition
      try {
        attributes[attributeName] = this.parseAttributeDefinition(attributeDefinition);
      } catch (error) {
        console.warn(`Warning: Could not parse attribute ${attributeName}, skipping`);
      }
    });
    
    return attributes;
  }

  /**
   * Split string by commas that are not inside braces
   * @param {string} str String to split
   * @returns {Array} Split parts
   */
  splitByTopLevelCommas(str) {
    const result = [];
    let current = '';
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const prevChar = i > 0 ? str[i - 1] : '';
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = '';
      } else if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        } else if (char === ',' && braceCount === 0) {
          result.push(current);
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      result.push(current);
    }
    
    return result;
  }

  /**
   * Parse attribute definition string to extract Sequelize configuration
   * @param {string} definition Attribute definition string
   * @returns {Object} Parsed attribute configuration
   */
  parseAttributeDefinition(definition) {
    try {
      // Simple parsing for common patterns
      const result = { type: DataTypes.STRING };

      // Parse type
      if (definition.includes('DataTypes.INTEGER')) {
        result.type = DataTypes.INTEGER;
      } else if (definition.includes('DataTypes.STRING')) {
        result.type = DataTypes.STRING;
        // Check for length
        const lengthMatch = definition.match(/DataTypes\.STRING\((\d+)\)/);
        if (lengthMatch) {
          result.type = DataTypes.STRING(parseInt(lengthMatch[1]));
        }
      } else if (definition.includes('DataTypes.TEXT')) {
        result.type = DataTypes.TEXT;
      } else if (definition.includes('DataTypes.BOOLEAN')) {
        result.type = DataTypes.BOOLEAN;
      } else if (definition.includes('DataTypes.DATE')) {
        result.type = DataTypes.DATE;
      } else if (definition.includes('DataTypes.ENUM')) {
        // Extract enum values
        const enumMatch = definition.match(/DataTypes\.ENUM\(([^)]+)\)/);
        if (enumMatch) {
          const enumStr = enumMatch[0];
          const valuesMatch = enumStr.match(/ENUM\(([^)]+)\)/);
          if (valuesMatch) {
            const values = valuesMatch[1].split(',').map(v => v.trim().replace(/['"]/g, ''));
            result.type = DataTypes.ENUM(...values);
          }
        }
      } else if (definition.includes('DataTypes.DECIMAL')) {
        result.type = DataTypes.DECIMAL;
        // Check for precision and scale
        const decimalMatch = definition.match(/DataTypes\.DECIMAL\((\d+),\s*(\d+)\)/);
        if (decimalMatch) {
          result.type = DataTypes.DECIMAL(parseInt(decimalMatch[1]), parseInt(decimalMatch[2]));
        }
      } else if (definition.includes('DataTypes.FLOAT')) {
        result.type = DataTypes.FLOAT;
      } else if (definition.includes('DataTypes.JSON')) {
        result.type = DataTypes.JSON;
      }

      // Parse other attributes
      if (definition.includes('allowNull: false')) {
        result.allowNull = false;
      }
      if (definition.includes('unique: true')) {
        result.unique = true;
      }
      if (definition.includes('primaryKey: true')) {
        result.primaryKey = true;
      }
      if (definition.includes('autoIncrement: true')) {
        result.autoIncrement = true;
      }

      // Parse defaultValue
      const defaultMatch = definition.match(/defaultValue\s*:\s*([^,}]+)/);
      if (defaultMatch) {
        const defaultStr = defaultMatch[1].trim();
        if (defaultStr === 'true') {
          result.defaultValue = true;
        } else if (defaultStr === 'false') {
          result.defaultValue = false;
        } else if (defaultStr === 'DataTypes.NOW') {
          result.defaultValue = 'NOW';
        } else if (defaultStr.match(/^['"`]/)) {
          result.defaultValue = defaultStr.replace(/['"]/g, '');
        } else if (!isNaN(defaultStr)) {
          result.defaultValue = parseFloat(defaultStr);
        } else {
          result.defaultValue = defaultStr.replace(/['"]/g, '');
        }
      }

      return result;
    } catch (error) {
      console.warn('Warning: Could not parse attribute definition, using default STRING type');
      return { type: DataTypes.STRING };
    }
  }
}

const generator = new MigrationGenerator();
const smartGenerator = new SmartMigrationGenerator();

/**
 * Check if models are in sync with database schema
 * @param {boolean} verbose Show detailed comparison
 */
async function checkDatabaseSync(verbose = false) {
  console.log('🔍 Checking sync status between models and database...\n');
  
  let sequelize;
  try {
    // Create fresh sequelize instance
    const { Sequelize } = require('sequelize');
    const config = require('../src/config/database')[process.env.NODE_ENV || 'development'];
    
    if (config.use_env_variable) {
      sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    const modelFiles = smartGenerator.getModelFiles();
    const syncResults = [];
    let allInSync = true;
    
    for (const modelFile of modelFiles) {
      const modelName = path.basename(modelFile, '.js');
      const tableName = smartGenerator.inferTableName(modelName);
      
      try {
        // Check if table exists in database
        const tableExists = await sequelize.getQueryInterface().describeTable(tableName);
        
        // Get model definition
        const modelDefinition = await smartGenerator.analyzeModelFile(modelFile);
        
        if (modelDefinition) {
          // Compare schema
          const comparison = await compareTableSchema(tableName, modelDefinition, tableExists, verbose);
          syncResults.push({
            model: modelName,
            table: tableName,
            status: comparison.inSync ? 'synced' : 'out-of-sync',
            issues: comparison.issues
          });
          
          if (!comparison.inSync) {
            allInSync = false;
          }
        }
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('no such table')) {
          console.log(`❌ ${modelName} → Table '${tableName}' does not exist in database`);
          syncResults.push({
            model: modelName,
            table: tableName,
            status: 'missing-table',
            issues: ['Table does not exist in database']
          });
          allInSync = false;
        } else {
          console.log(`⚠️  ${modelName} → Error checking table: ${error.message}`);
          syncResults.push({
            model: modelName,
            table: tableName,
            status: 'error',
            issues: [error.message]
          });
          allInSync = false;
        }
      }
    }
    
    // Display results
    console.log('\n📊 Sync Status Summary:\n');
    syncResults.forEach(result => {
      const statusIcon = {
        'synced': '✅',
        'out-of-sync': '❌',
        'missing-table': '❌',
        'error': '⚠️'
      }[result.status];
      
      console.log(`   ${statusIcon} ${result.model} → ${result.table} (${result.status})`);
      
      if (verbose && result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`      • ${issue}`);
        });
      }
    });
    
    console.log(`\n🎯 Overall Status: ${allInSync ? '✅ All models are in sync' : '❌ Models are out of sync'}`);
    
    if (!allInSync) {
      console.log('\n💡 Recommendations:');
      console.log('   • Run "migrate analyze" to generate missing migrations');
      console.log('   • Run "migrate" to apply pending migrations');
      console.log('   • Use "migrate sync:check -v" for detailed comparison');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure your database is running and configuration is correct');
    throw error;
  } finally {
    if (sequelize) {
      try {
        await sequelize.close();
      } catch (error) {
        // Ignore close errors
      }
    }
  }
}

/**
 * Compare table schema with model definition
 * @param {string} tableName Table name
 * @param {Object} modelDefinition Model definition
 * @param {Object} tableSchema Database table schema
 * @param {boolean} verbose Show detailed comparison
 * @returns {Object} Comparison result
 */
async function compareTableSchema(tableName, modelDefinition, tableSchema, verbose = false) {
  const issues = [];
  const modelAttributes = modelDefinition.attributes;
  
  // Check for missing columns in database
  Object.keys(modelAttributes).forEach(columnName => {
    if (!tableSchema[columnName]) {
      issues.push(`Column '${columnName}' exists in model but not in database`);
    }
  });
  
  // Check for extra columns in database
  Object.keys(tableSchema).forEach(columnName => {
    if (!modelAttributes[columnName] && !['createdAt', 'updatedAt'].includes(columnName)) {
      issues.push(`Column '${columnName}' exists in database but not in model`);
    }
  });
  
  // Check column types and constraints (basic comparison)
  Object.keys(modelAttributes).forEach(columnName => {
    const modelAttr = modelAttributes[columnName];
    const dbColumn = tableSchema[columnName];
    
    if (dbColumn) {
      // Check for nullable mismatch
      if (modelAttr.allowNull !== undefined && modelAttr.allowNull !== dbColumn.allowNull) {
        issues.push(`Column '${columnName}' allowNull mismatch: model=${modelAttr.allowNull}, db=${dbColumn.allowNull}`);
      }
      
      // Check for unique constraint mismatch
      if (modelAttr.unique !== undefined && modelAttr.unique !== dbColumn.unique) {
        issues.push(`Column '${columnName}' unique constraint mismatch`);
      }
    }
  });
  
  const inSync = issues.length === 0;
  
  if (verbose || !inSync) {
    console.log(`${inSync ? '✅' : '❌'} ${tableName}:`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log('   • Schema matches model definition');
    }
    console.log('');
  }
  
  return {
    inSync,
    issues
  };
}

/**
 * Check migration status - which migrations have been applied
 * @param {boolean} verbose Show detailed migration information
 */
async function checkMigrationStatus(verbose = false) {
  const sequelize = require('../src/models').sequelize;
  const fs = require('fs');
  const migrationsPath = path.resolve(__dirname, '..', 'src', 'migrations');
  
  console.log('📋 Checking migration status...');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get all migration files
    let migrationFiles = [];
    if (fs.existsSync(migrationsPath)) {
      migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.js'))
        .sort();
    }
    
    if (migrationFiles.length === 0) {
      console.log('📂 No migration files found in src/migrations/');
      return;
    }
    
    // Get executed migrations from database
    let executedMigrations = [];
    try {
      // Check if SequelizeMeta table exists
      await sequelize.getQueryInterface().describeTable('SequelizeMeta');
      
      // Get executed migrations
      const results = await sequelize.query(
        'SELECT name FROM SequelizeMeta ORDER BY name',
        { type: sequelize.QueryTypes.SELECT }
      );
      executedMigrations = Array.isArray(results) ? results.map(row => row.name) : [];
    } catch (error) {
      if (error.message.includes('no such table') || error.message.includes("doesn't exist")) {
        console.log('⚠️  SequelizeMeta table does not exist. No migrations have been run yet.');
      } else {
        throw error;
      }
    }
    
    // Analyze migration status
    const migrationStatus = migrationFiles.map(file => {
      const isExecuted = executedMigrations.includes(file);
      return {
        file,
        status: isExecuted ? 'executed' : 'pending',
        timestamp: extractTimestamp(file),
        name: extractMigrationName(file)
      };
    });
    
    // Display results
    const pendingMigrations = migrationStatus.filter(m => m.status === 'pending');
    const executedCount = migrationStatus.filter(m => m.status === 'executed').length;
    
    console.log(`📊 Migration Status Summary:`);
    console.log(`   Total migrations: ${migrationFiles.length}`);
    console.log(`   Executed: ${executedCount}`);
    console.log(`   Pending: ${pendingMigrations.length}`);
    
    if (verbose || pendingMigrations.length > 0) {
      console.log('📁 Migration Files:');
      
      migrationStatus.forEach(migration => {
        const statusIcon = migration.status === 'executed' ? '✅' : '⏳';
        const statusText = migration.status === 'executed' ? 'EXECUTED' : 'PENDING';
        
        console.log(`   ${statusIcon} ${migration.file} (${statusText})`);
        
        if (verbose) {
          console.log(`      Date: ${formatTimestamp(migration.timestamp)}`);
          console.log(`      Name: ${migration.name}`);
        }
      });
    }
    
    if (pendingMigrations.length > 0) {
      console.log(`
⏳ ${pendingMigrations.length} pending migration(s):`);
      pendingMigrations.forEach(migration => {
        console.log(`   • ${migration.file}`);
      });
      
      console.log('💡 Run "npm run migrate" to apply pending migrations');
    } else {
      console.log('✅ All migrations have been executed!');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure your database is running and configuration is correct');
    throw error;
  } finally {
    if (sequelize) {
      try {
        await sequelize.close();
      } catch (error) {
        // Ignore close errors
      }
    }
  }
}

/**
 * Extract timestamp from migration filename
 * @param {string} filename Migration filename
 * @returns {string} Timestamp
 */
function extractTimestamp(filename) {
  const match = filename.match(/^(\d{14})/);
  return match ? match[1] : '';
}

/**
 * Extract migration name from filename
 * @param {string} filename Migration filename
 * @returns {string} Migration name
 */
function extractMigrationName(filename) {
  const withoutExtension = filename.replace('.js', '');
  const withoutTimestamp = withoutExtension.replace(/^\d{14}-/, '');
  return withoutTimestamp.replace(/-/g, ' ');
}

/**
 * Format timestamp for display
 * @param {string} timestamp Timestamp string
 * @returns {string} Formatted date
 */
function formatTimestamp(timestamp) {
  if (!timestamp || timestamp.length !== 14) return 'Unknown';
  
  const year = timestamp.substr(0, 4);
  const month = timestamp.substr(4, 2);
  const day = timestamp.substr(6, 2);
  const hour = timestamp.substr(8, 2);
  const minute = timestamp.substr(10, 2);
  const second = timestamp.substr(12, 2);
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Helper function to parse column definition from string
function parseColumnDefinition(defStr) {
  // Handle format: name:type:options or type:options
  const hasName = defStr.includes(':') && defStr.split(':').length >= 2;
  
  let name, typeAndOptions;
  if (hasName) {
    const parts = defStr.split(':');
    name = parts[0];
    typeAndOptions = parts.slice(1).join(':');
  } else {
    typeAndOptions = defStr;
  }

  const parts = typeAndOptions.split(':');
  if (parts.length < 1) {
    throw new Error('Column definition must be in format "name:type:options" or "type:options"');
  }

  const type = parts[0].toUpperCase();
  const options = {};

  // Parse type
  if (type.includes('(')) {
    const match = type.match(/(\w+)\(([^)]+)\)/);
    if (match) {
      const typeName = match[1];
      const args = match[2].split(',').map(arg => arg.trim());
      
      switch (typeName) {
        case 'STRING':
          options.type = DataTypes.STRING(parseInt(args[0]));
          break;
        case 'ENUM':
          options.type = DataTypes.ENUM(...args.map(arg => arg.replace(/['"]/g, '')));
          break;
        default:
          options.type = DataTypes[typeName];
      }
    }
  } else {
    options.type = DataTypes[type];
  }

  if (!options.type) {
    throw new Error(`Unknown data type: ${type}`);
  }

  // Parse options
  if (parts.length > 1) {
    const optionsStr = parts.slice(1).join(':');
    const optionPairs = optionsStr.split(',');
    
    optionPairs.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      
      switch (key) {
        case 'allowNull':
          options.allowNull = value === 'true';
          break;
        case 'unique':
          options.unique = value === 'true';
          break;
        case 'primaryKey':
          options.primaryKey = value === 'true';
          break;
        case 'autoIncrement':
          options.autoIncrement = value === 'true';
          break;
        case 'defaultValue':
          if (value === 'true' || value === 'false') {
            options.defaultValue = value === 'true';
          } else if (!isNaN(value)) {
            options.defaultValue = parseFloat(value);
          } else {
            options.defaultValue = value.replace(/['"]/g, '');
          }
          break;
      }
    });
  }

  return { name, ...options };
}

// ======================
// Smart Migration Commands
// ======================

// Command: Smart analyzer - analyze all models
program
  .command('analyze')
  .description('🔍 Analyze models and generate missing migrations automatically')
  .action(async () => {
    try {
      await smartGenerator.generateMissingMigrations();
    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      process.exit(1);
    }
  });

// Command: List models and migration status
program
  .command('list')
  .description('📋 List all models and their migration status')
  .action(() => {
    try {
      console.log('📁 Available models:\n');
      smartGenerator.getModelFiles().forEach(file => {
        const modelName = path.basename(file, '.js');
        const tableName = smartGenerator.inferTableName(modelName);
        const exists = smartGenerator.migrationExists(tableName);
        console.log(`   ${exists ? '✅' : '❌'} ${modelName} → ${tableName}`);
      });
      console.log('\n💡 Use "migrate analyze" to generate missing migrations');
    } catch (error) {
      console.error('❌ Error listing models:', error.message);
      process.exit(1);
    }
  });

// Command: Check sync status between models and database
program
  .command('sync:check')
  .description('🔍 Check if models are in sync with database schema')
  .option('-v, --verbose', 'Show detailed comparison')
  .action(async (options) => {
    try {
      await checkDatabaseSync(options.verbose);
    } catch (error) {
      console.error('❌ Error checking sync status:', error.message);
      process.exit(1);
    }
  });

// Command: Check migration status (deprecated - use sequelize-cli instead)
// program
//   .command('migrations:status')
//   .description('📋 Check which migrations have been applied to the database')
//   .option('-v, --verbose', 'Show detailed migration information')
//   .action(async (options) => {
//     try {
//       await checkMigrationStatus(options.verbose);
//     } catch (error) {
//       console.error('❌ Error checking migration status:', error.message);
//       process.exit(1);
//     }
//   });

// Command: Show comprehensive database status
program
  .command('status')
  .description('📊 Show comprehensive status of models, migrations, and database')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      console.log('🎯 Comprehensive Database Status Report\n');
      console.log('═'.repeat(60) + '\n');
      
      // 1. Models and Migration Files Status
      console.log('📁 MODELS & MIGRATION FILES');
      console.log('─'.repeat(30));
      smartGenerator.getModelFiles().forEach(file => {
        const modelName = path.basename(file, '.js');
        const tableName = smartGenerator.inferTableName(modelName);
        const exists = smartGenerator.migrationExists(tableName);
        console.log(`   ${exists ? '✅' : '❌'} ${modelName} → ${tableName}`);
      });
      console.log('');
      
      // 2. Check if database is available before running database-dependent checks
      let sequelize;
      
      try {
        // Create fresh sequelize instance for status checks
        const { Sequelize } = require('sequelize');
        const config = require('../src/config/database')[process.env.NODE_ENV || 'development'];
        
        if (config.use_env_variable) {
          sequelize = new Sequelize(process.env[config.use_env_variable], config);
        } else {
          sequelize = new Sequelize(config.database, config.username, config.password, config);
        }
        
        await sequelize.authenticate();
        
        // 2. Migration Execution Status
        console.log('⏳ MIGRATION EXECUTION STATUS');
        console.log('─'.repeat(30));
        await checkMigrationStatus(false);
        
        // 3. Model-Database Sync Status (with fresh connection)
        console.log('\n🔄 MODEL-DATABASE SYNC STATUS');
        console.log('─'.repeat(30));
        await checkDatabaseSync(options.verbose);
        
      } catch (dbError) {
        console.log('⏳ MIGRATION EXECUTION STATUS');
        console.log('─'.repeat(30));
        console.log('❌ Database not available:', dbError.message);
        console.log('💡 Run database setup first: npm run db:create && npm run migrate\n');
        
        console.log('🔄 MODEL-DATABASE SYNC STATUS');
        console.log('─'.repeat(30));
        console.log('❌ Cannot check sync status - database not available');
        console.log('💡 Configure database connection in .env file');
      } finally {
        if (sequelize) {
          try {
            await sequelize.close();
          } catch (error) {
            // Ignore close errors
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error generating status report:', error.message);
      process.exit(1);
    }
  });

// ======================
// Manual Migration Commands (CLI Only - not in package.json)
// Available via: node scripts/migrate.js <command>
// ======================

// Command: Create table migration
program
  .command('create:table')
  .description('📝 Create a new table migration')
  .argument('<tableName>', 'Name of the table')
  .option('-c, --columns [columns...]', 'Column definitions (format: name:type:options)')
  .option('--no-timestamps', 'Disable timestamps (createdAt, updatedAt)')
  .action(async (tableName, options) => {
    try {
      const attributes = {};
      
      if (options.columns) {
        options.columns.forEach(col => {
          const parsed = parseColumnDefinition(col);
          const { name, ...definition } = parsed;
          if (name) {
            attributes[name] = definition;
          }
        });
      }

      const migration = generator.generateCreateTableMigration(
        tableName,
        attributes,
        { timestamps: options.timestamps }
      );
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Add column migration
program
  .command('add:column')
  .description('➕ Add a column to existing table')
  .argument('<tableName>', 'Name of the table')
  .argument('<columnName>', 'Name of the column')
  .argument('<columnDef>', 'Column definition (format: type:options)')
  .action(async (tableName, columnName, columnDef) => {
    try {
      const definition = parseColumnDefinition(`${columnName}:${columnDef}`);
      const { name, ...columnDefinition } = definition;
      const migration = generator.generateAddColumnMigration(tableName, columnName, columnDefinition);
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Remove column migration
program
  .command('remove:column')
  .description('➖ Remove a column from existing table')
  .argument('<tableName>', 'Name of the table')
  .argument('<columnName>', 'Name of the column')
  .action(async (tableName, columnName) => {
    try {
      const migration = generator.generateRemoveColumnMigration(tableName, columnName);
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Modify column migration
program
  .command('modify:column')
  .description('🔧 Modify a column in existing table')
  .argument('<tableName>', 'Name of the table')
  .argument('<columnName>', 'Name of the column')
  .argument('<columnDef>', 'New column definition (format: type:options)')
  .action(async (tableName, columnName, columnDef) => {
    try {
      const definition = parseColumnDefinition(columnDef);
      const migration = generator.generateModifyColumnMigration(tableName, columnName, definition);
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Add index migration
program
  .command('add:index')
  .description('📊 Add an index to table')
  .argument('<tableName>', 'Name of the table')
  .argument('<columns>', 'Column names (comma-separated for composite index)')
  .option('-u, --unique', 'Create unique index')
  .option('-n, --name <name>', 'Custom index name')
  .action(async (tableName, columns, options) => {
    try {
      const columnArray = columns.split(',').map(col => col.trim());
      const migration = generator.generateAddIndexMigration(tableName, columnArray, {
        unique: options.unique,
        name: options.name
      });
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Add foreign key migration
program
  .command('add:foreign-key')
  .description('🔗 Add a foreign key constraint to existing table')
  .argument('<tableName>', 'Name of the table')
  .argument('<columnName>', 'Name of the foreign key column')
  .argument('<referencesTable>', 'Referenced table name')
  .argument('<referencesColumn>', 'Referenced column name')
  .option('--on-update <action>', 'On update action (CASCADE, SET NULL, RESTRICT)', 'CASCADE')
  .option('--on-delete <action>', 'On delete action (CASCADE, SET NULL, RESTRICT)', 'SET NULL')
  .action(async (tableName, columnName, referencesTable, referencesColumn, options) => {
    try {
      const migration = generator.generateAddForeignKeyMigration(
        tableName, 
        columnName, 
        referencesTable, 
        referencesColumn,
        {
          onUpdate: options.onUpdate,
          onDelete: options.onDelete
        }
      );
      
      generator.writeMigrationFile(migration.fileName, migration.content);
      console.log(`✅ Migration created: ${migration.fileName}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Command: Generate from model
program
  .command('from:model')
  .description('🎯 Generate migration from existing model file')
  .argument('<modelPath>', 'Path to model file')
  .action(async (modelPath) => {
    try {
      const fullPath = path.resolve(modelPath);
      await generator.generateFromModel(fullPath);
      console.log(`✅ Migration created from model: ${modelPath}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// ======================
// Program Configuration
// ======================

program
  .name('migrate')
  .description('🚀 Unified Sequelize Migration Generator')
  .version('2.0.0')
  .addHelpText('after', `

Examples:
  Status & Analysis:
    migrate status            # Comprehensive database status report
    migrate list             # Show all models and migration file status
    migrate migrations:status # Check which migrations have been applied
    migrate sync:check       # Check if models match database schema
    migrate analyze          # Generate missing migrations automatically
  
  Manual Migration:
    migrate create:table products -c "name:STRING(100):allowNull=false" "price:DECIMAL"
    migrate add:column products description "TEXT:allowNull=true"
    migrate add:index products name -u
    migrate add:foreign-key orders customerId users id --on-delete CASCADE
    migrate from:model src/models/Product.js

💡 Pro Tips:
  - Use "migrate status" for comprehensive overview of everything
  - Use "migrate migrations:status" to check which migrations are pending
  - Use "migrate sync:check" to verify models match database
  - Use "migrate analyze" to auto-generate missing migrations
  - Add "-v" or "--verbose" to any command for detailed information
`);

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse();
