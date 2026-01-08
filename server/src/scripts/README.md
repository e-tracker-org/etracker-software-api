# Database Migration Scripts

This directory contains database migration scripts for the E-Tracker API.

## Property Type Migration

### Overview
Migrates existing properties from `apartmentType` to the new `propertyType` field to support expanded property types including landed properties.

### Methods to Run Migration

#### 1. Command Line (Recommended)
```bash
# From the server directory
npm run migrate:property-types
```

#### 2. Direct Script Execution
```bash
# From the server directory
node src/scripts/run-migration.js
```

#### 3. API Endpoint (Admin Only)
```bash
# Check migration status
GET /api/v1/migration/status

# Run migration
POST /api/v1/migration/property-types
```

### What the Migration Does

1. **Finds** all properties that have `apartmentType` but no `propertyType`
2. **Copies** the value from `apartmentType` to `propertyType`
3. **Reports** success/failure for each property
4. **Provides** a summary of the migration results

### Migration Safety

- The migration is **non-destructive** - it only adds the new field
- The old `apartmentType` field is kept for backward compatibility
- Each property is updated individually with error handling
- Failed migrations are logged and reported

### Supported Property Types

After migration, the system supports these property types:

**Apartments:**
- Flat, Studio, Penthouse, Loft

**Landed Properties:**
- Bungalow, Duplex, Detached House, Semi-Detached, Terraced House, Mansion, Villa, Land

**Commercial:**
- Office, Shop, Warehouse

### Environment Variables Required

Make sure these are set in your `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
# or
DATABASE_URL=your_mongodb_connection_string
```

### Troubleshooting

1. **Connection Issues**: Ensure MongoDB is running and connection string is correct
2. **Permission Issues**: Ensure the database user has write permissions
3. **Partial Migration**: Check the error logs for specific property IDs that failed

### Re-running Migration

The migration is idempotent - you can run it multiple times safely. It will only process properties that haven't been migrated yet.