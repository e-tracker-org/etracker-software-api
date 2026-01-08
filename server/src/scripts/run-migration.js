#!/usr/bin/env node

/**
 * Standalone migration script
 * Usage: node run-migration.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Use the same database utility as main app
const { connectToDatabase, disconnectFromDatabase } = require('../utils/database');
const { migratePropertyTypes } = require('./migrate-property-types');

async function runMigration() {
  try {
    console.log('🚀 Starting Property Migration');
    console.log('================================');
    
    // Connect to MongoDB using same connection as main app
    console.log('Connecting to database...');
    await connectToDatabase();
    
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
    // Disconnect from MongoDB using same utility as main app
    await disconnectFromDatabase();
    console.log('🔌 Disconnected from database');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted');
  await disconnectFromDatabase();
  process.exit(1);
});

// Run the migration
runMigration();