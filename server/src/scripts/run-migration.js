#!/usr/bin/env node

/**
 * Standalone migration script
 * Usage: node run-migration.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Use MongoDB config that works with JavaScript
const mongoConfig = require('../../config/mongodb.config');
const { migratePropertyTypes } = require('./migrate-property-types');

async function runMigration() {
  try {
    console.log('🚀 Starting Property Migration');
    console.log('================================');
    
    // Connect to MongoDB using environment variable or config
    const mongoUrl = process.env.DB_CONNECTION_STRING || mongoConfig.url;
    console.log(`Connecting to MongoDB: ${mongoUrl.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ Connected to MongoDB');
    
    console.log('✓ Connected to MongoDB');
    
    // Run migration
    const result = await migratePropertyTypes();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      if (result.errors && result.errors.length > 0) {
        console.log('⚠️  Some properties had errors during migration');
        process.exit(1);
      }
    } else {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted');
  await mongoose.disconnect();
  process.exit(1);
});

// Run the migration
runMigration();