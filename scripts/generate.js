#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

class CodeGenerator {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.modelsPath = path.join(this.srcPath, 'models');
    this.controllersPath = path.join(this.srcPath, 'controllers');
    this.routesPath = path.join(this.srcPath, 'routes');
    this.servicesPath = path.join(this.srcPath, 'services');
    this.validatorsPath = path.join(this.srcPath, 'validators');
  }

  // Utility functions
  toPascalCase(str) {
    return str.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
  }

  toCamelCase(str) {
    return str.charAt(0).toLowerCase() + this.toPascalCase(str).slice(1);
  }

  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  toSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  pluralize(str) {
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch') || str.endsWith('x') || str.endsWith('z')) {
      return str + 'es';
    }
    return str + 's';
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Template generators
  generateModelTemplate(name, attributes = []) {
    const className = this.toPascalCase(name);
    const tableName = this.pluralize(this.toSnakeCase(name));

    let attributesCode = '';
    if (attributes.length > 0) {
      attributesCode = attributes.map(attr => {
        const [fieldName, dataType = 'STRING', ...options] = attr.split(':');
        const optionsStr = options.length > 0 ? `, {\n      ${options.join(',\n      ')}\n    }` : '';
        return `    ${fieldName}: {\n      type: DataTypes.${dataType.toUpperCase()}${optionsStr}\n    }`;
      }).join(',\n');
    } else {
      attributesCode = `    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }`;
    }

    return `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ${className} = sequelize.define('${className}', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
${attributesCode}
  }, {
    tableName: '${tableName}',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Define associations
  ${className}.associate = (models) => {
    // Define relationships here
    // Example:
    // ${className}.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    // ${className}.hasMany(models.${className}Item, { foreignKey: '${this.toCamelCase(name)}Id', as: 'items' });
  };

  return ${className};
};
`;
  }

  generateControllerTemplate(name) {
    const className = this.toPascalCase(name);
    const variableName = this.toCamelCase(name);
    const serviceName = `${this.toCamelCase(name)}Service`;

    return `const ${serviceName} = require('../services/${serviceName}');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseUtils');
const { validationResult } = require('express-validator');

class ${className}Controller {
  /**
   * Get all ${this.pluralize(variableName)}
   */
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, isActive } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      };

      const result = await ${serviceName}.getAll(options);
      
      successResponse(res, result, \`\${className} list retrieved successfully\`);
    } catch (error) {
      console.error('Error in ${className}Controller.getAll:', error);
      errorResponse(res, 'Failed to retrieve ${this.pluralize(variableName)}', 500);
    }
  }

  /**
   * Get ${variableName} by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const ${variableName} = await ${serviceName}.getById(id);

      if (!${variableName}) {
        return notFoundResponse(res, '${className}');
      }

      successResponse(res, ${variableName}, \`\${className} retrieved successfully\`);
    } catch (error) {
      console.error(\`Error in \${className}Controller.getById:\`, error);
      errorResponse(res, \`Failed to retrieve \${variableName}\`, 500);
    }
  }

  /**
   * Create new ${variableName}
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const ${variableName}Data = req.body;
      
      // Add user ID if authenticated
      if (req.user) {
        ${variableName}Data.createdBy = req.user.id;
      }

      const new${className} = await ${serviceName}.create(${variableName}Data);
      
      successResponse(res, new${className}, \`\${className} created successfully\`, 201);
    } catch (error) {
      console.error(\`Error in \${className}Controller.create:\`, error);
      
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(res, 'Validation failed', 400, error.errors);
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return errorResponse(res, \`\${className} already exists\`, 409);
      }
      
      errorResponse(res, \`Failed to create \${variableName}\`, 500);
    }
  }

  /**
   * Update ${variableName}
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const updated${className} = await ${serviceName}.update(id, updateData);

      if (!updated${className}) {
        return notFoundResponse(res, '${className}');
      }

      successResponse(res, updated${className}, \`\${className} updated successfully\`);
    } catch (error) {
      console.error(\`Error in \${className}Controller.update:\`, error);
      
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(res, 'Validation failed', 400, error.errors);
      }
      
      errorResponse(res, \`Failed to update \${variableName}\`, 500);
    }
  }

  /**
   * Delete ${variableName}
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ${serviceName}.delete(id);

      if (!deleted) {
        return notFoundResponse(res, '${className}');
      }

      successResponse(res, null, \`\${className} deleted successfully\`);
    } catch (error) {
      console.error(\`Error in \${className}Controller.delete:\`, error);
      errorResponse(res, \`Failed to delete \${variableName}\`, 500);
    }
  }

  /**
   * Toggle ${variableName} status
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const updated${className} = await ${serviceName}.toggleStatus(id);

      if (!updated${className}) {
        return notFoundResponse(res, '${className}');
      }

      successResponse(res, updated${className}, \`\${className} status updated successfully\`);
    } catch (error) {
      console.error(\`Error in \${className}Controller.toggleStatus:\`, error);
      errorResponse(res, \`Failed to update \${variableName} status\`, 500);
    }
  }
}

module.exports = new ${className}Controller();
`;
  }

  generateServiceTemplate(name) {
    const className = this.toPascalCase(name);
    const variableName = this.toCamelCase(name);

    return `const { ${className} } = require('../models');
const { Op } = require('sequelize');

class ${className}Service {
  /**
   * Get all ${this.pluralize(variableName)} with pagination and filters
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: \`%\${search}%\` } },
        { description: { [Op.iLike]: \`%\${search}%\` } }
      ];
    }

    // Status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await ${className}.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      paranoid: true // Exclude soft-deleted records
    });

    return {
      ${this.pluralize(variableName)}: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  /**
   * Get ${variableName} by ID
   */
  async getById(id) {
    return await ${className}.findByPk(id, {
      paranoid: true
    });
  }

  /**
   * Create new ${variableName}
   */
  async create(${variableName}Data) {
    return await ${className}.create(${variableName}Data);
  }

  /**
   * Update ${variableName}
   */
  async update(id, updateData) {
    const ${variableName} = await ${className}.findByPk(id);
    
    if (!${variableName}) {
      return null;
    }

    await ${variableName}.update(updateData);
    return ${variableName};
  }

  /**
   * Delete ${variableName} (soft delete)
   */
  async delete(id) {
    const ${variableName} = await ${className}.findByPk(id);
    
    if (!${variableName}) {
      return false;
    }

    await ${variableName}.destroy();
    return true;
  }

  /**
   * Toggle ${variableName} status
   */
  async toggleStatus(id) {
    const ${variableName} = await ${className}.findByPk(id);
    
    if (!${variableName}) {
      return null;
    }

    await ${variableName}.update({
      isActive: !${variableName}.isActive
    });

    return ${variableName};
  }

  /**
   * Get active ${this.pluralize(variableName)}
   */
  async getActive() {
    return await ${className}.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      paranoid: true
    });
  }

  /**
   * Search ${this.pluralize(variableName)} by name
   */
  async searchByName(name) {
    return await ${className}.findAll({
      where: {
        name: {
          [Op.iLike]: \`%\${name}%\`
        },
        isActive: true
      },
      order: [['name', 'ASC']],
      paranoid: true
    });
  }
}

module.exports = new ${className}Service();
`;
  }

  generateRouteTemplate(name) {
    const className = this.toPascalCase(name);
    const variableName = this.toCamelCase(name);
    const kebabName = this.toKebabCase(name);
    const controllerName = `${variableName}Controller`;
    const validatorName = `${variableName}Validator`;

    return `const express = require('express');
const router = express.Router();
const ${controllerName} = require('../controllers/${controllerName}');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const ${validatorName} = require('../validators/${validatorName}');

/**
 * @swagger
 * components:
 *   schemas:
 *     ${className}:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the ${variableName}
 *         name:
 *           type: string
 *           description: The name of the ${variableName}
 *         description:
 *           type: string
 *           description: The description of the ${variableName}
 *         isActive:
 *           type: boolean
 *           description: Whether the ${variableName} is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the ${variableName} was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the ${variableName} was last updated
 */

/**
 * @swagger
 * tags:
 *   name: ${this.toPascalCase(this.pluralize(name))}
 *   description: ${className} management API
 */

/**
 * @swagger
 * /api/${kebabName}s:
 *   get:
 *     summary: Get all ${this.pluralize(variableName)}
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of ${this.pluralize(variableName)}
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ${this.pluralize(variableName)}:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/${className}'
 *                     pagination:
 *                       type: object
 */
router.get('/', auth, ${controllerName}.getAll);

/**
 * @swagger
 * /api/${kebabName}s/{id}:
 *   get:
 *     summary: Get ${variableName} by ID
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${className} ID
 *     responses:
 *       200:
 *         description: ${className} details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/${className}'
 *       404:
 *         description: ${className} not found
 */
router.get('/:id', auth, ${controllerName}.getById);

/**
 * @swagger
 * /api/${kebabName}s:
 *   post:
 *     summary: Create new ${variableName}
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: ${className} created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth, validate(${validatorName}.create), ${controllerName}.create);

/**
 * @swagger
 * /api/${kebabName}s/{id}:
 *   put:
 *     summary: Update ${variableName}
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${className} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: ${className} updated successfully
 *       404:
 *         description: ${className} not found
 */
router.put('/:id', auth, validate(${validatorName}.update), ${controllerName}.update);

/**
 * @swagger
 * /api/${kebabName}s/{id}:
 *   delete:
 *     summary: Delete ${variableName}
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${className} ID
 *     responses:
 *       200:
 *         description: ${className} deleted successfully
 *       404:
 *         description: ${className} not found
 */
router.delete('/:id', auth, ${controllerName}.delete);

/**
 * @swagger
 * /api/${kebabName}s/{id}/toggle-status:
 *   patch:
 *     summary: Toggle ${variableName} status
 *     tags: [${this.toPascalCase(this.pluralize(name))}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${className} ID
 *     responses:
 *       200:
 *         description: ${className} status updated successfully
 *       404:
 *         description: ${className} not found
 */
router.patch('/:id/toggle-status', auth, ${controllerName}.toggleStatus);

module.exports = router;
`;
  }

  generateValidatorTemplate(name) {
    const className = this.toPascalCase(name);
    const variableName = this.toCamelCase(name);

    return `const { body, param, query } = require('express-validator');

const ${variableName}Validator = {
  /**
   * Validation rules for creating ${variableName}
   */
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],

  /**
   * Validation rules for updating ${variableName}
   */
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ${variableName} ID'),
    
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],

  /**
   * Validation rules for ${variableName} ID parameter
   */
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ${variableName} ID')
  ],

  /**
   * Validation rules for query parameters
   */
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Search term must not exceed 255 characters'),
    
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ]
};

module.exports = ${variableName}Validator;
`;
  }

  // Main generation functions
  async generateModel(name, attributes = []) {
    console.log(`🏗️  Generating model: ${name}`);
    
    this.ensureDirectoryExists(this.modelsPath);
    
    const fileName = `${this.toPascalCase(name)}.js`;
    const filePath = path.join(this.modelsPath, fileName);
    
    if (fs.existsSync(filePath)) {
      throw new Error(`Model ${fileName} already exists`);
    }
    
    const content = this.generateModelTemplate(name, attributes);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Model created: src/models/${fileName}`);
    return filePath;
  }

  async generateController(name) {
    console.log(`🎮 Generating controller: ${name}`);
    
    this.ensureDirectoryExists(this.controllersPath);
    
    const fileName = `${this.toCamelCase(name)}Controller.js`;
    const filePath = path.join(this.controllersPath, fileName);
    
    if (fs.existsSync(filePath)) {
      throw new Error(`Controller ${fileName} already exists`);
    }
    
    const content = this.generateControllerTemplate(name);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Controller created: src/controllers/${fileName}`);
    return filePath;
  }

  async generateService(name) {
    console.log(`⚙️  Generating service: ${name}`);
    
    this.ensureDirectoryExists(this.servicesPath);
    
    const fileName = `${this.toCamelCase(name)}Service.js`;
    const filePath = path.join(this.servicesPath, fileName);
    
    if (fs.existsSync(filePath)) {
      throw new Error(`Service ${fileName} already exists`);
    }
    
    const content = this.generateServiceTemplate(name);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Service created: src/services/${fileName}`);
    return filePath;
  }

  async generateRoute(name) {
    console.log(`🛣️  Generating route: ${name}`);
    
    this.ensureDirectoryExists(this.routesPath);
    
    const fileName = `${this.pluralize(this.toKebabCase(name))}.js`;
    const filePath = path.join(this.routesPath, fileName);
    
    if (fs.existsSync(filePath)) {
      throw new Error(`Route ${fileName} already exists`);
    }
    
    const content = this.generateRouteTemplate(name);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Route created: src/routes/${fileName}`);
    return filePath;
  }

  async generateValidator(name) {
    console.log(`✅ Generating validator: ${name}`);
    
    this.ensureDirectoryExists(this.validatorsPath);
    
    const fileName = `${this.toCamelCase(name)}Validator.js`;
    const filePath = path.join(this.validatorsPath, fileName);
    
    if (fs.existsSync(filePath)) {
      throw new Error(`Validator ${fileName} already exists`);
    }
    
    const content = this.generateValidatorTemplate(name);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Validator created: src/validators/${fileName}`);
    return filePath;
  }

  async generateScaffold(name, attributes = []) {
    console.log(`\n🚀 Generating complete scaffold for: ${name}`);
    console.log('═'.repeat(50));
    
    try {
      const files = {
        model: await this.generateModel(name, attributes),
        service: await this.generateService(name),
        controller: await this.generateController(name),
        validator: await this.generateValidator(name),
        route: await this.generateRoute(name)
      };
      
      console.log('\n🎉 Scaffold generation completed!');
      console.log('═'.repeat(50));
      console.log('📁 Generated files:');
      Object.entries(files).forEach(([type, path]) => {
        console.log(`   ${type.padEnd(10)} → ${path.replace(process.cwd(), '.')}`);
      });
      
      console.log('\n📝 Next steps:');
      console.log(`   1. Add route to src/server.js:`);
      console.log(`      app.use('/api/${this.pluralize(this.toKebabCase(name))}', require('./routes/${this.pluralize(this.toKebabCase(name))}'));`);
      console.log(`   2. Run migration to create table:`);
      console.log(`      npm run migrate analyze`);
      console.log(`   3. Test your new API endpoints! 🚀`);
      
      return files;
    } catch (error) {
      console.error('❌ Error generating scaffold:', error.message);
      throw error;
    }
  }
}

// CLI setup
const generator = new CodeGenerator();

program
  .name('generate')
  .description('Code generator for Express API scaffolding')
  .version('1.0.0');

// Generate model command
program
  .command('model <name>')
  .description('Generate a new Sequelize model')
  .option('-a, --attributes <attributes...>', 'Model attributes (field:type:options)')
  .action(async (name, options) => {
    try {
      await generator.generateModel(name, options.attributes || []);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Generate controller command
program
  .command('controller <name>')
  .description('Generate a new controller')
  .action(async (name) => {
    try {
      await generator.generateController(name);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Generate service command
program
  .command('service <name>')
  .description('Generate a new service')
  .action(async (name) => {
    try {
      await generator.generateService(name);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Generate route command
program
  .command('route <name>')
  .description('Generate a new route')
  .action(async (name) => {
    try {
      await generator.generateRoute(name);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Generate validator command
program
  .command('validator <name>')
  .description('Generate a new validator')
  .action(async (name) => {
    try {
      await generator.generateValidator(name);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Generate scaffold command (all files)
program
  .command('scaffold <name>')
  .description('Generate complete scaffold (model, controller, service, route, validator)')
  .option('-a, --attributes <attributes...>', 'Model attributes (field:type:options)')
  .action(async (name, options) => {
    try {
      await generator.generateScaffold(name, options.attributes || []);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Parse CLI arguments
program.parse();
