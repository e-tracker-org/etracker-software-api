import { TenantModel } from '../newTenant/tenant.model';
import logger from '../../utils/logger';

/**
 * ✅ FIX #8: Lease Overlap Validation Service
 * 
 * Prevents multiple tenants from occupying same property during overlapping periods.
 * Validates date ranges don't conflict before adding new tenants.
 */

export interface LeaseConflict {
  conflict: boolean;
  conflictingTenant?: any;
  conflictDetails?: string;
}

/**
 * Check if requested lease dates overlap with existing active leases
 * 
 * @param propertyId - Property being rented
 * @param moveInDate - New tenant's move-in date
 * @param moveOutDate - New tenant's move-out date
 * @param excludeTenantId - Tenant ID to exclude (when updating)
 * @returns Object indicating if conflict exists and details
 */
export async function checkLeaseConflict(
  propertyId: string,
  moveInDate: Date,
  moveOutDate: Date,
  excludeTenantId?: string
): Promise<LeaseConflict> {
  try {
    // Validate input dates
    if (!propertyId || !moveInDate || !moveOutDate) {
      return { conflict: false }; // Skip validation if incomplete
    }

    if (moveInDate >= moveOutDate) {
      return {
        conflict: true,
        conflictDetails: 'Move-in date must be before move-out date',
      };
    }

    // Build query for overlapping leases
    // Overlap occurs when: existing.startDate < new.endDate AND existing.endDate > new.startDate
    const query: any = {
      propertyId,
      status: 'ACTIVE', // Only check active leases
      moveInDate: { $lt: moveOutDate }, // Existing starts before new ends
      moveOutDate: { $gt: moveInDate }, // Existing ends after new starts
    };

    // If updating existing lease, exclude that tenant from conflict check
    if (excludeTenantId) {
      query.tenantId = { $ne: excludeTenantId };
    }

    const conflictingTenant = await TenantModel.findOne(query);

    if (conflictingTenant) {
      return {
        conflict: true,
        conflictingTenant,
        conflictDetails: `Property already rented from ${conflictingTenant.moveInDate?.toLocaleDateString()} to ${conflictingTenant.moveOutDate?.toLocaleDateString()}`,
      };
    }

    logger.info(`✅ No lease conflicts found for property ${propertyId}`);
    return { conflict: false };
  } catch (error) {
    logger.error('❌ Error checking lease conflict:', error);
    throw error;
  }
}

/**
 * Get all active leases for a property that haven't expired yet
 * 
 * @param propertyId - Property ID
 * @returns Array of active leases
 */
export async function getActiveLeases(propertyId: string) {
  try {
    const today = new Date();
    
    const activeLeases = await TenantModel.find({
      propertyId,
      status: 'ACTIVE',
      moveOutDate: { $gte: today }, // Not expired
    }).sort({ moveInDate: 1 });

    return activeLeases;
  } catch (error) {
    logger.error('Error fetching active leases:', error);
    throw error;
  }
}

/**
 * Get all tenants for a property (active and inactive)
 * 
 * @param propertyId - Property ID
 * @returns Array of all tenants for property
 */
export async function getPropertyTenants(propertyId: string) {
  try {
    const tenants = await TenantModel.find({ propertyId }).sort({ moveInDate: -1 });
    return tenants;
  } catch (error) {
    logger.error('Error fetching property tenants:', error);
    throw error;
  }
}

/**
 * Get lease history for a property (timeline view)
 * Useful for landlord dashboard
 * 
 * @param propertyId - Property ID
 * @returns Timeline of all tenancies
 */
export async function getPropertyLeaseHistory(propertyId: string) {
  try {
    const history = await TenantModel.find({ propertyId })
      .select('tenantId moveInDate moveOutDate rentAmount status bookingId')
      .sort({ moveInDate: -1 });

    return history.map((lease: any) => ({
      tenantId: lease.tenantId,
      moveInDate: lease.moveInDate,
      moveOutDate: lease.moveOutDate,
      rentAmount: lease.rentAmount,
      status: lease.status,
      duration: lease.moveOutDate
        ? Math.round(
            (lease.moveOutDate.getTime() - lease.moveInDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + ' days'
        : 'Ongoing',
      bookingId: lease.bookingId, // ✅ FIX #7: Can trace back to original application
    }));
  } catch (error) {
    logger.error('Error fetching lease history:', error);
    throw error;
  }
}

/**
 * Find expired leases that should be deactivated
 * Used by scheduled job (cron) to auto-deactivate leases
 * 
 * @returns Array of leases that have expired
 */
export async function findExpiredLeases() {
  try {
    const today = new Date();

    const expiredLeases = await TenantModel.find({
      status: 'ACTIVE',
      moveOutDate: { $lte: today }, // Expired on or before today
    });

    return expiredLeases;
  } catch (error) {
    logger.error('Error finding expired leases:', error);
    throw error;
  }
}

/**
 * Deactivate a lease (marks tenant as inactive)
 * 
 * @param tenantId - Tenant ID to deactivate
 * @returns Updated lease document
 */
export async function deactivateLease(tenantId: string) {
  try {
    const updated = await TenantModel.findByIdAndUpdate(
      tenantId,
      { status: 'INACTIVE' },
      { new: true }
    );

    logger.info(`✅ Deactivated lease for tenant ${tenantId}`);
    return updated;
  } catch (error) {
    logger.error('Error deactivating lease:', error);
    throw error;
  }
}

/**
 * Deactivate multiple expired leases at once
 * Used by scheduled job
 * 
 * @returns Number of leases deactivated
 */
export async function deactivateExpiredLeases(): Promise<number> {
  try {
    const today = new Date();

    const result = await TenantModel.updateMany(
      {
        status: 'ACTIVE',
        moveOutDate: { $lte: today }, // Expired
      },
      {
        status: 'INACTIVE',
        updatedAt: new Date(),
      }
    );

    logger.info(`✅ Deactivated ${result.modifiedCount} expired leases`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('❌ Error deactivating expired leases:', error);
    throw error;
  }
}
