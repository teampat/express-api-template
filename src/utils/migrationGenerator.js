const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');

/**
 * Migration Generator Utility
 * Generates Sequelize migrations automatically from model definitions or schemas
 */
class MigrationGenerator {
  constructor() {
    this.migrationsPath = path.resolve(__dirname, '..', 'migrations');
    this.timestampCounter = 0; // Counter for ensuring uniqueness
  }

  /**
   * Generate timestamp for migration filename
   * @returns {string} Timestamp in format YYYYMMDDHHMMSS
   */
  generateTimestamp() {
    const now = new Date();
    // Increment counter for uniqueness
    this.timestampCounter++;
    const baseTimestamp = now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0') +
           now.getSeconds().toString().padStart(2, '0');
    
    // Add counter to ensure uniqueness within same second
    const counterSuffix = (this.timestampCounter % 100).toString().padStart(2, '0');
    return baseTimestamp + counterSuffix;
  }

  /**
   * Convert Sequelize DataType to migration string
   * @param {Object|string} dataType Sequelize attribute definition or column definition object
   * @returns {Object} Migration attribute object
   */
  convertDataType(dataType) {
    // Handle column definition object
    if (dataType && typeof dataType === 'object' && dataType.type) {
      const result = {
        type: this.convertDataTypeString(dataType.type),
        allowNull: dataType.allowNull !== false,
        defaultValue: dataType.defaultValue,
        primaryKey: dataType.primaryKey || false,
        autoIncrement: dataType.autoIncrement || false,
        unique: dataType.unique || false
      };
      return result;
    }
    
    // Handle direct DataType object or string
    return {
      type: this.convertDataTypeString(dataType),
      allowNull: true
    };
  }

  /**
   * Convert DataType string/object to Sequelize migration string
   * @param {Object|string} dataType 
   * @returns {string}
   */
  convertDataTypeString(dataType) {
    if (!dataType) {
      return 'Sequelize.STRING';
    }

    // Handle string types (from tests)
    if (typeof dataType === 'string') {
      if (dataType.includes('ENUM')) {
        return dataType.replace('DataTypes.', 'Sequelize.');
      }
      return dataType.replace('DataTypes.', 'Sequelize.');
    }

    if (typeof dataType.toString !== 'function') {
      return 'Sequelize.STRING';
    }

    const typeStr = dataType.toString();
    
    // Handle ENUM types with proper value extraction
    if (typeStr.includes('ENUM')) {
      const enumMatch = typeStr.match(/ENUM\((.*?)\)/);
      if (enumMatch) {
        const values = enumMatch[1].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const quotedValues = values.map(v => `'${v.toUpperCase()}'`).join(', ');
        return `Sequelize.ENUM(${quotedValues})`;
      }
      // Handle direct ENUM values
      if (dataType.values && Array.isArray(dataType.values)) {
        const quotedValues = dataType.values.map(v => `'${v}'`).join(', ');
        return `Sequelize.ENUM(${quotedValues})`;
      }
    }
    
    // Handle STRING with length
    if (typeStr.includes('VARCHAR') || typeStr.includes('STRING')) {
      const lengthMatch = typeStr.match(/\((\d+)\)/);
      if (lengthMatch) {
        return `Sequelize.STRING(${lengthMatch[1]})`;
      }
      return 'Sequelize.STRING';
    }
    
    // Handle DECIMAL with precision and scale
    if (typeStr.includes('DECIMAL')) {
      const decimalMatch = typeStr.match(/DECIMAL\((\d+),\s*(\d+)\)/);
      if (decimalMatch) {
        return `Sequelize.DECIMAL(${decimalMatch[1]}, ${decimalMatch[2]})`;
      }
      return 'Sequelize.DECIMAL';
    }
    
    // Map other common types
    const typeMapping = {
      'INTEGER': 'Sequelize.INTEGER',
      'BIGINT': 'Sequelize.BIGINT', 
      'FLOAT': 'Sequelize.FLOAT',
      'DOUBLE': 'Sequelize.DOUBLE',
      'BOOLEAN': 'Sequelize.BOOLEAN',
      'DATE': 'Sequelize.DATE',
      'DATEONLY': 'Sequelize.DATEONLY',
      'TIME': 'Sequelize.TIME',
      'TEXT': 'Sequelize.TEXT',
      'JSON': 'Sequelize.JSON',
      'JSONB': 'Sequelize.JSONB',
      'UUID': 'Sequelize.UUID'
    };
    
    // Check if it's a simple type
    for (const [dbType, seqType] of Object.entries(typeMapping)) {
      if (typeStr.includes(dbType)) {
        return seqType;
      }
    }
    
    // Default fallback
    return 'Sequelize.STRING';
  }

  /**
   * Generate create table migration
   * @param {string} tableName Name of the table
   * @param {Object} attributes Table attributes definition
   * @param {Object} options Additional options
   * @returns {string} Migration file content
   */
  generateCreateTableMigration(tableName, attributes, options = {}) {
    const timestamp = this.generateTimestamp();
    const migrationName = `${timestamp}-create-${tableName.toLowerCase()}`;
    
    let attributesString = '';
    let foreignKeys = [];
    let indexes = options.indexes || [];
    
    // Add default id field if not provided
    if (!attributes.id) {
      attributesString += `      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },\n`;
    }

    // Process attributes
    Object.entries(attributes).forEach(([fieldName, fieldDef]) => {
      const converted = this.convertDataType(fieldDef);
      attributesString += `      ${fieldName}: {\n`;
      attributesString += `        type: ${converted.type}`;
      
      if (!converted.allowNull) {
        attributesString += ',\n        allowNull: false';
      }
      
      if (converted.primaryKey) {
        attributesString += ',\n        primaryKey: true';
      }
      
      if (converted.autoIncrement) {
        attributesString += ',\n        autoIncrement: true';
      }
      
      if (converted.unique) {
        attributesString += ',\n        unique: true';
      }
      
      if (converted.defaultValue !== undefined) {
        if (typeof converted.defaultValue === 'string') {
          attributesString += `,\n        defaultValue: '${converted.defaultValue}'`;
        } else if (converted.defaultValue === 'NOW') {
          attributesString += `,\n        defaultValue: Sequelize.NOW`;
        } else {
          attributesString += `,\n        defaultValue: ${converted.defaultValue}`;
        }
      }
      
      // Add validation if exists
      if (fieldDef.validate) {
        attributesString += ',\n        validate: ' + JSON.stringify(fieldDef.validate, null, 10).replace(/\n/g, '\n        ');
      }
      
      // Add foreign key references
      if (fieldDef.references) {
        attributesString += ',\n        references: {';
        attributesString += `\n          model: '${fieldDef.references.model}',`;
        attributesString += `\n          key: '${fieldDef.references.key}'`;
        attributesString += '\n        }';
        
        if (fieldDef.onUpdate) {
          attributesString += `,\n        onUpdate: '${fieldDef.onUpdate}'`;
        }
        
        if (fieldDef.onDelete) {
          attributesString += `,\n        onDelete: '${fieldDef.onDelete}'`;
        }
        
        // Store foreign key info for later
        foreignKeys.push({
          field: fieldName,
          references: fieldDef.references,
          onUpdate: fieldDef.onUpdate || 'CASCADE',
          onDelete: fieldDef.onDelete || 'SET NULL'
        });
      }
      
      attributesString += '\n      },\n';
    });

    // Add timestamps if not disabled
    if (options.timestamps !== false) {
      attributesString += `      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }\n`;
    }

    // Generate migration content with foreign keys and indexes
    let migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('${tableName}', {
${attributesString}    });`;

    // Add foreign key constraints
    if (foreignKeys.length > 0) {
      migrationContent += '\n\n    // Add foreign key constraints';
      foreignKeys.forEach(fk => {
        migrationContent += `
    await queryInterface.addConstraint('${tableName}', {
      fields: ['${fk.field}'],
      type: 'foreign key',
      name: 'fk_${tableName}_${fk.field}',
      references: {
        table: '${fk.references.model}',
        field: '${fk.references.key}'
      },
      onUpdate: '${fk.onUpdate}',
      onDelete: '${fk.onDelete}'
    });`;
      });
    }

    // Add indexes
    if (indexes.length > 0) {
      migrationContent += '\n\n    // Add indexes';
      indexes.forEach((index, i) => {
        const indexName = index.name || `${tableName}_${index.fields.join('_')}_index`;
        const fields = index.fields.map(f => `'${f}'`).join(', ');
        
        migrationContent += `
    await queryInterface.addIndex('${tableName}', [${fields}], {
      name: '${indexName}'`;
        
        if (index.unique) {
          migrationContent += ',\n      unique: true';
        }
        
        migrationContent += '\n    });';
      });
    }

    migrationContent += `
  },

  async down(queryInterface, Sequelize) {`;

    // Remove indexes first
    if (indexes.length > 0) {
      migrationContent += '\n    // Remove indexes';
      indexes.forEach(index => {
        const indexName = index.name || `${tableName}_${index.fields.join('_')}_index`;
        migrationContent += `
    await queryInterface.removeIndex('${tableName}', '${indexName}');`;
      });
    }

    // Remove foreign key constraints
    if (foreignKeys.length > 0) {
      migrationContent += '\n\n    // Remove foreign key constraints';
      foreignKeys.forEach(fk => {
        migrationContent += `
    await queryInterface.removeConstraint('${tableName}', 'fk_${tableName}_${fk.field}');`;
      });
    }

    migrationContent += `
    
    await queryInterface.dropTable('${tableName}');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Generate add column migration
   * @param {string} tableName Name of the table
   * @param {string} columnName Name of the column
   * @param {Object} columnDefinition Column definition
   * @returns {string} Migration file content
   */
  generateAddColumnMigration(tableName, columnName, columnDefinition) {
    const timestamp = this.generateTimestamp();
    const migrationName = `${timestamp}-add-${columnName}-to-${tableName.toLowerCase()}`;
    
    const converted = this.convertDataType(columnDefinition);
    
    let columnDef = `{
      type: ${converted.type}`;
    
    if (!converted.allowNull) {
      columnDef += ',\n      allowNull: false';
    }
    
    if (converted.defaultValue !== undefined) {
      if (typeof converted.defaultValue === 'string') {
        columnDef += `,\n      defaultValue: '${converted.defaultValue}'`;
      } else {
        columnDef += `,\n      defaultValue: ${converted.defaultValue}`;
      }
    }
    
    columnDef += '\n    }';

    const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('${tableName}', '${columnName}', ${columnDef});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('${tableName}', '${columnName}');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Generate remove column migration
   * @param {string} tableName Name of the table
   * @param {string} columnName Name of the column
   * @returns {string} Migration file content
   */
  generateRemoveColumnMigration(tableName, columnName) {
    const timestamp = this.generateTimestamp();
    const migrationName = `${timestamp}-remove-${columnName}-from-${tableName.toLowerCase()}`;

    const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('${tableName}', '${columnName}');
  },

  async down(queryInterface, Sequelize) {
    // Note: You may need to specify the column definition for proper rollback
    // await queryInterface.addColumn('${tableName}', '${columnName}', {
    //   type: Sequelize.STRING, // Specify the correct type
    //   allowNull: true
    // });
    throw new Error('Manual rollback required. Please specify column definition.');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Generate modify column migration
   * @param {string} tableName Name of the table
   * @param {string} columnName Name of the column
   * @param {Object} newColumnDefinition New column definition
   * @returns {string} Migration file content
   */
  generateModifyColumnMigration(tableName, columnName, newColumnDefinition) {
    const timestamp = this.generateTimestamp();
    const migrationName = `${timestamp}-modify-${columnName}-in-${tableName.toLowerCase()}`;
    
    const converted = this.convertDataType(newColumnDefinition);
    
    let columnDef = `{
      type: ${converted.type}`;
    
    if (!converted.allowNull) {
      columnDef += ',\n      allowNull: false';
    }
    
    if (converted.defaultValue !== undefined) {
      if (typeof converted.defaultValue === 'string') {
        columnDef += `,\n      defaultValue: '${converted.defaultValue}'`;
      } else {
        columnDef += `,\n      defaultValue: ${converted.defaultValue}`;
      }
    }
    
    columnDef += '\n    }';

    const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('${tableName}', '${columnName}', ${columnDef});
  },

  async down(queryInterface, Sequelize) {
    // Note: Manual rollback required. Please specify the previous column definition.
    throw new Error('Manual rollback required. Please specify previous column definition.');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Generate add index migration
   * @param {string} tableName Name of the table
   * @param {Array|string} columns Column(s) to index
   * @param {Object} options Index options
   * @returns {string} Migration file content
   */
  generateAddIndexMigration(tableName, columns, options = {}) {
    const timestamp = this.generateTimestamp();
    const columnStr = Array.isArray(columns) ? columns.join('-') : columns;
    const migrationName = `${timestamp}-add-index-${columnStr}-to-${tableName.toLowerCase()}`;
    
    const indexName = options.name || `${tableName}_${columnStr}_index`;
    const columnsArray = Array.isArray(columns) ? columns : [columns];
    const columnsStr = columnsArray.map(col => `'${col}'`).join(', ');

    let optionsStr = '';
    if (options.unique) {
      optionsStr += '\n      unique: true,';
    }
    if (options.name) {
      optionsStr += `\n      name: '${options.name}',`;
    }

    const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('${tableName}', [${columnsStr}], {${optionsStr}
      name: '${indexName}'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('${tableName}', '${indexName}');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Generate add foreign key migration
   * @param {string} tableName Name of the table
   * @param {string} columnName Name of the foreign key column
   * @param {string} referencesTable Referenced table name
   * @param {string} referencesColumn Referenced column name
   * @param {Object} options Foreign key options
   * @returns {string} Migration file content
   */
  generateAddForeignKeyMigration(tableName, columnName, referencesTable, referencesColumn, options = {}) {
    const timestamp = this.generateTimestamp();
    const migrationName = `${timestamp}-add-foreign-key-${columnName}-to-${tableName.toLowerCase()}`;
    
    const { onUpdate = 'CASCADE', onDelete = 'SET NULL' } = options;
    const constraintName = `fk_${tableName}_${columnName}`;

    const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('${tableName}', {
      fields: ['${columnName}'],
      type: 'foreign key',
      name: '${constraintName}',
      references: {
        table: '${referencesTable}',
        field: '${referencesColumn}'
      },
      onUpdate: '${onUpdate}',
      onDelete: '${onDelete}'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('${tableName}', '${constraintName}');
  }
};
`;

    return { fileName: `${migrationName}.js`, content: migrationContent };
  }

  /**
   * Write migration file to disk
   * @param {string} fileName Migration file name
   * @param {string} content Migration file content
   */
  writeMigrationFile(fileName, content) {
    const filePath = path.join(this.migrationsPath, fileName);
    
    // Ensure migrations directory exists
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migration created: ${fileName}`);
    return filePath;
  }

  /**
   * Generate migration from model file
   * @param {string} modelPath Path to model file
   * @returns {string} Generated migration file path
   */
  async generateFromModel(modelPath) {
    try {
      // Import the model
      const Model = require(modelPath);
      const tableName = Model.tableName || Model.name.toLowerCase() + 's';
      const attributes = Model.rawAttributes || {};

      // Remove sequelize internal attributes
      const cleanAttributes = {};
      Object.entries(attributes).forEach(([key, value]) => {
        if (!['createdAt', 'updatedAt'].includes(key)) {
          cleanAttributes[key] = value;
        }
      });

      const migration = this.generateCreateTableMigration(tableName, cleanAttributes);
      return this.writeMigrationFile(migration.fileName, migration.content);
    } catch (error) {
      console.error('Error generating migration from model:', error.message);
      throw error;
    }
  }
}

module.exports = MigrationGenerator;
