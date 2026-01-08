/**
 * Migration script to update existing properties from apartmentType to propertyType
 * Run this script once to migrate existing data
 */

const db = require('../models');
const Property = db.property;

async function migratePropertyTypes() {
  try {
    console.log('Starting property type migration...');
    
    // Find all properties that have apartmentType but no propertyType
    const propertiesToMigrate = await Property.find({
      apartmentType: { $exists: true },
      propertyType: { $exists: false }
    });
    
    console.log(`Found ${propertiesToMigrate.length} properties to migrate`);
    
    let migratedCount = 0;
    let errors = [];
    
    for (const property of propertiesToMigrate) {
      try {
        // Copy apartmentType to propertyType
        await Property.updateOne(
          { _id: property._id },
          { $set: { propertyType: property.apartmentType } }
        );
        migratedCount++;
        console.log(`✓ Migrated property ${property._id}: ${property.apartmentType} → ${property.apartmentType}`);
      } catch (error) {
        errors.push({ propertyId: property._id, error: error.message });
        console.error(`✗ Failed to migrate property ${property._id}:`, error.message);
      }
    }
    
    console.log(`\n=== Migration Summary ===`);
    console.log(`Total properties found: ${propertiesToMigrate.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(err => {
        console.log(`  - Property ${err.propertyId}: ${err.error}`);
      });
    }
    
    return { success: true, migratedCount, errors };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in controllers or run directly
module.exports = { migratePropertyTypes };

// Uncomment below to run directly with: node migrate-property-types.js
/*
if (require.main === module) {
  // Connect to database first
  const mongoose = require('mongoose');
  const config = require('../config/mongodb.config');
  
  mongoose.connect(config.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
    migratePropertyTypes().then(() => {
      mongoose.disconnect();
      process.exit(0);
    });
  }).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
}
*/