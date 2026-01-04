import * as cron from 'node-cron';
import { deactivateExpiredLeases } from '../modules/lease/lease.service';
import logger from '../utils/logger';

/**
 * ✅ FIX #9: Auto-Deactivate Expired Leases
 * 
 * Scheduled job that runs daily to mark leases as INACTIVE when they expire.
 * Prevents billing for tenants who have moved out.
 * Runs at midnight (00:00) every day.
 */

export function startLeaseExpirationJob() {
  try {
    // Run every day at midnight
    // Cron: "minute hour day month day-of-week"
    // "0 0 * * *" = 00:00 every day
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('🔄 Starting lease expiration job...');
        
        const deactivatedCount = await deactivateExpiredLeases();
        
        if (deactivatedCount > 0) {
          logger.info(`✅ Lease expiration job completed. Deactivated ${deactivatedCount} leases`);
          // Optional: Send notification email to landlords about expired leases
          // await notifyLandlordsOfExpiredLeases();
        } else {
          logger.info('✅ Lease expiration job completed. No expired leases found.');
        }
      } catch (error) {
        logger.error('❌ Error in lease expiration job:', error);
        // Don't throw - let job continue running even if this execution fails
      }
    });

    logger.info('✅ Lease expiration job scheduled (runs daily at 00:00)');
    return job;
  } catch (error) {
    logger.error('❌ Failed to start lease expiration job:', error);
    throw error;
  }
}

/**
 * Optional: Start lease warning job (7 days before expiration)
 * Sends notification to landlord/tenant about upcoming lease end
 */
export function startLeaseWarningJob() {
  try {
    // Run daily at 08:00 (morning reminder)
    const job = cron.schedule('0 8 * * *', async () => {
      try {
        logger.info('🔄 Starting lease warning job...');
        
        // Query for leases expiring within 7 days
        const today = new Date();
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        // This would require a function in lease.service.ts:
        // const expiringLeases = await TenantModel.find({
        //   status: 'ACTIVE',
        //   moveOutDate: { $gte: today, $lte: sevenDaysLater }
        // });

        logger.info('✅ Lease warning job completed.');
      } catch (error) {
        logger.error('❌ Error in lease warning job:', error);
      }
    });

    logger.info('✅ Lease warning job scheduled (runs daily at 08:00)');
    return job;
  } catch (error) {
    logger.error('❌ Failed to start lease warning job:', error);
    throw error;
  }
}

/**
 * Optional: Start transaction cleanup job
 * Archives old completed transactions (beyond 2 years)
 */
export function startTransactionArchiveJob() {
  try {
    // Run monthly on the 1st at 02:00 AM
    const job = cron.schedule('0 2 1 * *', async () => {
      try {
        logger.info('🔄 Starting transaction archive job...');
        
        // Would implement archiving old transactions here
        // const twoYearsAgo = new Date();
        // twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        
        logger.info('✅ Transaction archive job completed.');
      } catch (error) {
        logger.error('❌ Error in transaction archive job:', error);
      }
    });

    logger.info('✅ Transaction archive job scheduled (runs monthly on 1st at 02:00)');
    return job;
  } catch (error) {
    logger.error('❌ Failed to start transaction archive job:', error);
    throw error;
  }
}

/**
 * Stop all scheduled jobs (useful for testing or graceful shutdown)
 */
export function stopAllScheduledJobs() {
  try {
    // Get all tasks and stop them
    const tasks = cron.getTasks();
    tasks.forEach((task: any) => {
      task.stop();
    });
    logger.info('✅ All scheduled jobs stopped');
  } catch (error) {
    logger.error('❌ Error stopping scheduled jobs:', error);
  }
}
