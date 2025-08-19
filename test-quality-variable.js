#!/usr/bin/env node

/**
 * Test script for Updated IMAGE_QUALITY Environment Variable
 * 
 * This script tests the updated environment variable name:
 * - IMAGE_QUALITY (was IMAGE_DEFAULT_QUALITY)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import the fileService with updated environment variables
const fileService = require('./src/services/fileService');

console.log('🎨 Updated IMAGE_QUALITY Environment Variable Test');
console.log('='.repeat(60));

// Test 1: Check Updated Environment Variables
console.log('\n📋 Current Environment Variables (Updated Names):');
console.log(`  IMAGE_RESIZE: ${process.env.IMAGE_RESIZE}`);
console.log(`  IMAGE_MAX_WIDTH: ${process.env.IMAGE_MAX_WIDTH}`);
console.log(`  IMAGE_MAX_HEIGHT: ${process.env.IMAGE_MAX_HEIGHT}`);
console.log(`  IMAGE_QUALITY: ${process.env.IMAGE_QUALITY}`);
console.log(`  IMAGE_CONVERT: ${process.env.IMAGE_CONVERT}`);
console.log(`  IMAGE_CONVERT_FORMAT: ${process.env.IMAGE_CONVERT_FORMAT}`);

// Test 2: Verify Old Variable Name Doesn't Exist
console.log('\n🗑️  Old Environment Variable (Should be undefined):');
console.log(`  IMAGE_DEFAULT_QUALITY: ${process.env.IMAGE_DEFAULT_QUALITY || 'undefined'}`);

// Test 3: Check Image Configuration Loading
console.log('\n⚙️  Loaded Image Configuration with New Variable:');
try {
  const config = fileService.getImageConfig();
  console.log('  ✅ Configuration loaded successfully:');
  console.log(`     - Processing Enabled: ${config.enabled}`);
  console.log(`     - Max Dimensions: ${config.maxWidth}x${config.maxHeight}`);
  console.log(`     - Image Quality (IMAGE_QUALITY): ${config.quality}`);
  console.log(`     - Auto Convert: ${config.autoConvert}`);
  console.log(`     - Convert Format: ${config.convertFormat}`);
} catch (error) {
  console.log('  ❌ Configuration loading failed:', error.message);
}

// Test 4: Quality Value Validation
console.log('\n🎯 Quality Value Validation:');
const qualityTests = [
  { env: '85', expected: 85, description: 'Standard quality (85%)' },
  { env: '100', expected: 100, description: 'Maximum quality (100%)' },
  { env: '50', expected: 50, description: 'Medium quality (50%)' },
  { env: '1', expected: 1, description: 'Minimum quality (1%)' },
];

// Backup current value
const originalQuality = process.env.IMAGE_QUALITY;

qualityTests.forEach(test => {
  process.env.IMAGE_QUALITY = test.env;
  const config = fileService.getImageConfig();
  const status = config.quality === test.expected ? '✅' : '❌';
  console.log(`  ${status} ${test.description}: ${config.quality}`);
});

// Restore original value
process.env.IMAGE_QUALITY = originalQuality;

console.log('\n🎉 IMAGE_QUALITY Variable Test Complete!');
console.log('='.repeat(60));
console.log('\n✨ Variable Name Change:');
console.log('   • IMAGE_DEFAULT_QUALITY → IMAGE_QUALITY');
console.log('\n💡 Benefits of new name:');
console.log('   • Shorter and more concise');
console.log('   • Clearer purpose (image quality setting)');
console.log('   • Consistent with other IMAGE_* variables');
