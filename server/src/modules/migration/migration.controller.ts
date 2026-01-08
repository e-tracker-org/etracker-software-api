/**
 * Migration API endpoints for database migrations
 */

import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/response';

// Use require for JavaScript module to avoid TypeScript declaration issues
const { migratePropertyTypes } = require('../../scripts/migrate-property-types');

// Type definitions for migration functions
interface MigrationResult {
  success: boolean;
  migratedCount?: number;
  errors?: Array<{ propertyId: string; error: string }>;
  error?: string;
}

export async function runPropertyTypeMigration(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Running property type migration via API...');
    
    const result: MigrationResult = await migratePropertyTypes();
    
    if (result.success) {
      return apiResponse(
        res, 
        'Property type migration completed successfully', 
        {
          migratedCount: result.migratedCount,
          errors: result.errors || []
        }
      );
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Migration API error:', error);
    next(error);
  }
}

export async function getMigrationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = require('../../models');
    const Property = db.property;
    
    // Check how many properties need migration
    const needsMigration = await Property.countDocuments({
      apartmentType: { $exists: true },
      propertyType: { $exists: false }
    });
    
    const alreadyMigrated = await Property.countDocuments({
      propertyType: { $exists: true }
    });
    
    const total = await Property.countDocuments();
    
    return apiResponse(res, 'Migration status retrieved', {
      needsMigration,
      alreadyMigrated, 
      total,
      migrationComplete: needsMigration === 0
    });
  } catch (error) {
    console.error('Migration status error:', error);
    next(error);
  }
}