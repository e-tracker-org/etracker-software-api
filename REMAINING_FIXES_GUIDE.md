# Remaining Fixes - Implementation Guide

## Fix #7: Link NewTenant to Booking

### Why This Matters
Currently, Booking and NewTenant are disconnected. When you approve a booking and create a tenant account, there's no way to know which NewTenant record came from which original application.

### Implementation

**Step 1: Update NewTenant Model**

File: `server/models/tenant.model.js` or wherever NewTenant is defined

```javascript
// Add this field to NewTenant schema:
bookingId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Booking',
  required: true,
  index: true // For fast lookups
}
```

**Step 2: Update Landlord Controller**

File: `server/src/modules/landlord/landlord.controller.ts`

```typescript
// In addTenantToPropertyHandler or addPropertyHandler:

export async function addPropertyHandler(req: Request, res: Response, next: NextFunction) {
  const { propertyId, bookingId, tenantId, moveInDate, moveOutDate, rentAmount } = req.body;
  
  try {
    // ✅ NEW: Validate booking exists
    const booking = await findBookingById(bookingId);
    if (!booking) {
      return apiError(res, 'Booking/Application not found', StatusCodes.NOT_FOUND);
    }

    // ✅ NEW: Verify booking is approved
    if (booking.status !== 'APPROVED') {
      return apiError(res, 'Can only add approved applications', StatusCodes.BAD_REQUEST);
    }

    // ✅ NEW: Verify booking tenant matches
    if (booking.tenantId !== tenantId) {
      return apiError(res, 'Tenant does not match booking', StatusCodes.BAD_REQUEST);
    }

    // Existing validation code...
    const property = await findPropertyById(propertyId);
    if (!property) return apiError(res, 'Property not found');

    // Create NewTenant with bookingId link
    const newTenant = new NewTenant({
      bookingId, // ✅ Link to original application
      propertyId,
      tenantId,
      moveInDate: new Date(moveInDate),
      moveOutDate: new Date(moveOutDate),
      rentAmount,
      status: 'ACTIVE',
    });

    await newTenant.save();

    // ✅ Update booking status to completed
    await updateBooking(bookingId, {
      status: 'COMPLETED',
      moveInDate: new Date(moveInDate),
    });

    return apiResponse(res, 'Tenant added to property', newTenant, StatusCodes.CREATED);
  } catch (err) {
    next(err);
  }
}
```

---

## Fix #8: Lease Overlap Validation

### Why This Matters
Property can have multiple tenants (different rooms), but same room can't be rented twice simultaneously. Need to validate move-in/move-out date conflicts.

### Implementation

**Step 1: Create Lease Service**

File: `server/src/modules/lease/lease.service.ts` (NEW FILE)

```typescript
import { NewTenant } from '../../models'; // Wherever NewTenant is defined

export async function checkLeaseConflict(
  propertyId: string,
  moveInDate: Date,
  moveOutDate: Date,
  excludeTenantId?: string
): Promise<{ conflict: boolean; conflictingTenant?: any }> {
  try {
    // Find any lease that overlaps with requested dates
    const query: any = {
      propertyId,
      status: 'ACTIVE',
      moveInDate: { $lt: moveOutDate }, // Existing lease starts before new one ends
      moveOutDate: { $gt: moveInDate }, // Existing lease ends after new one starts
    };

    // If updating existing lease, exclude that tenant
    if (excludeTenantId) {
      query.tenantId = { $ne: excludeTenantId };
    }

    const conflictingTenant = await NewTenant.findOne(query);

    if (conflictingTenant) {
      return {
        conflict: true,
        conflictingTenant,
      };
    }

    return { conflict: false };
  } catch (error) {
    console.error('Error checking lease conflict:', error);
    throw error;
  }
}

export async function getActiveLeases(propertyId: string) {
  try {
    return await NewTenant.find({
      propertyId,
      status: 'ACTIVE',
      moveOutDate: { $gte: new Date() }, // Not expired
    }).sort({ moveInDate: 1 });
  } catch (error) {
    console.error('Error fetching active leases:', error);
    throw error;
  }
}
```

**Step 2: Use in Landlord Controller**

File: `server/src/modules/landlord/landlord.controller.ts`

```typescript
import { checkLeaseConflict } from '../lease/lease.service';

export async function addPropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { propertyId, tenantId, moveInDate, moveOutDate, rentAmount } = req.body;

  try {
    // ... existing validation ...

    // ✅ NEW: Check for lease conflicts
    const moveIn = new Date(moveInDate);
    const moveOut = new Date(moveOutDate);

    if (moveIn >= moveOut) {
      return apiError(res, 'Move-in date must be before move-out date', StatusCodes.BAD_REQUEST);
    }

    const { conflict, conflictingTenant } = await checkLeaseConflict(
      propertyId,
      moveIn,
      moveOut
    );

    if (conflict) {
      return apiError(
        res,
        `Property is already rented from ${conflictingTenant.moveInDate.toLocaleDateString()} to ${conflictingTenant.moveOutDate.toLocaleDateString()}`,
        StatusCodes.CONFLICT
      );
    }

    // Safe to proceed with tenant addition
    // ... rest of existing code ...
  } catch (err) {
    next(err);
  }
}
```

---

## Fix #9: Auto-Deactivate Expired Leases

### Why This Matters
Without automatic expiration, tenants stay marked as ACTIVE forever, even after lease ends. Landlords might keep billing them indefinitely.

### Implementation

**Step 1: Create Scheduled Job**

File: `server/src/jobs/deactivate-expired-leases.job.ts` (NEW FILE)

```typescript
import * as cron from 'node-cron';
import { NewTenant } from '../../models'; // Wherever NewTenant is defined
import logger from '../../utils/logger';

export function startLeaseExpirationJob() {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running lease expiration job...');

      const result = await NewTenant.updateMany(
        {
          status: 'ACTIVE',
          moveOutDate: { $lte: new Date() }, // Lease ended today or earlier
        },
        {
          status: 'INACTIVE',
          updatedAt: new Date(),
        }
      );

      logger.info(`✅ Lease expiration job completed. Deactivated ${result.modifiedCount} leases`);

      // Optional: Send notifications to landlords
      if (result.modifiedCount > 0) {
        await notifyLandlordsOfExpiredLeases();
      }
    } catch (error) {
      logger.error('❌ Error in lease expiration job:', error);
    }
  });

  logger.info('✅ Lease expiration job scheduled (runs daily at 00:00)');
}

async function notifyLandlordsOfExpiredLeases() {
  // Implementation: Send email to landlords about leases that expired
  // This is optional but helpful for property management
}
```

**Step 2: Register Job in Main Application**

File: `server/src/main.ts`

```typescript
import { startLeaseExpirationJob } from './jobs/deactivate-expired-leases.job';

async function main() {
  // ... existing code ...

  // Start scheduled jobs
  startLeaseExpirationJob();

  // ... rest of code ...
}

main();
```

**Step 3: Validate in Transaction Creation**

File: `server/src/modules/transaction/transaction.controller.ts`

```typescript
export async function createTransactionHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { propertyId, tenantId, category, amount, dueDate } = req.body;

  try {
    // ... existing validation ...

    // ✅ NEW: Validate tenant has active lease
    const activeLease = await NewTenant.findOne({
      propertyId,
      tenantId,
      status: 'ACTIVE',
      moveInDate: { $lte: new Date() },
      moveOutDate: { $gte: new Date() }, // Not expired
    });

    if (!activeLease) {
      return apiError(
        res,
        'Tenant does not have an active lease in this property',
        StatusCodes.BAD_REQUEST
      );
    }

    // Safe to create transaction
    // ... rest of existing code ...
  } catch (err) {
    next(err);
  }
}
```

---

## Fix #10: Secure Email Tracking

### Why This Matters
Current endpoint allows anyone to query any email and see all applications. This is a privacy/security risk.

### Implementation Option A: Email Verification Tokens

File: `server/src/modules/booking/booking-tracking.service.ts` (NEW FILE)

```typescript
import crypto from 'crypto';
import { sendEmail } from '../email-service';

interface EmailToken {
  email: string;
  token: string;
  expiresAt: Date;
}

const emailTokens = new Map<string, EmailToken>(); // Use Redis in production

export async function sendTrackingLink(email: string, propertyId?: string) {
  try {
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    emailTokens.set(email, { email, token, expiresAt });

    // Send email with tracking link
    const trackingUrl = `${process.env.FRONTEND_URL}/track-application?token=${token}&email=${encodeURIComponent(email)}`;

    const template = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Track Your Application</h2>
        <p>Click the link below to view your application status:</p>
        <a href="${trackingUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          View Application Status
        </a>
        <p style="color: #666; margin-top: 20px;">
          This link expires in 24 hours.
        </p>
      </div>
    `;

    await sendEmail(email, 'Track Your Property Application', template);

    return { success: true, message: 'Tracking link sent to your email' };
  } catch (error) {
    console.error('Error sending tracking link:', error);
    throw error;
  }
}

export async function verifyTrackingToken(email: string, token: string): Promise<boolean> {
  const stored = emailTokens.get(email);

  if (!stored) return false;
  if (stored.token !== token) return false;
  if (stored.expiresAt < new Date()) {
    emailTokens.delete(email); // Clean up expired token
    return false;
  }

  return true;
}
```

**Step 2: Update Booking Controller**

File: `server/src/modules/booking/booking.controller.ts`

```typescript
import { sendTrackingLink, verifyTrackingToken } from './booking-tracking.service';

// ✅ NEW: Send tracking link when application is created
export async function createBookingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // ... existing code ...

    const booking = await createBooking({ /* ... */ });

    // ✅ NEW: Send tracking link to applicant
    try {
      await sendTrackingLink(booking.tenantEmail);
    } catch (trackingError) {
      console.error('Error sending tracking link:', trackingError);
    }

    return apiResponse(res, 'Application submitted. Check your email for tracking link.', booking, 201);
  } catch (err) {
    next(err);
  }
}

// ✅ NEW: Secure endpoint for tracking
export async function getApplicationsByTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, token } = req.query;

    if (!email || !token || typeof email !== 'string' || typeof token !== 'string') {
      return apiError(res, 'Email and token required', StatusCodes.BAD_REQUEST);
    }

    // Verify token
    const isValid = await verifyTrackingToken(email, token);
    if (!isValid) {
      return apiError(res, 'Invalid or expired tracking link', StatusCodes.UNAUTHORIZED);
    }

    // Safe to return applications
    const bookings = await findBookingsByTenant(email);
    return apiResponse(res, 'Applications found', bookings, 200);
  } catch (err) {
    next(err);
  }
}
```

**Step 3: Update Routes**

File: `server/src/modules/booking/booking.route.ts`

```typescript
// Replace old insecure endpoint
// ❌ router.get('/tenant/:email', getBookingsByTenantEmailHandler);

// ✅ NEW: Secure endpoint
router.get('/track', getApplicationsByTokenHandler); // Requires token
router.post('/send-tracking-link', sendTrackingLinkHandler); // GET link via email
```

---

## Fix #11: Multi-Step Email Verification for Applications

### Additional Security Layer

**Send initial confirmation that email is valid:**

```typescript
export async function sendApplicationConfirmationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;

  try {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Store in cache/DB with expiry
    await cacheVerificationToken(email, verificationToken, 24); // 24 hours
    
    // Send email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await sendEmail(
      email,
      'Verify Your Email for Property Application',
      `Click here to verify: ${verifyUrl}`
    );
    
    return apiResponse(res, 'Verification email sent', { email });
  } catch (err) {
    next(err);
  }
}
```

---

## Summary of Remaining Fixes

| Fix | Files to Create/Modify | Priority | Est. Time |
|-----|------------------------|----------|-----------|
| #7 | NewTenant model + landlord.controller | 🔴 HIGH | 30 min |
| #8 | lease.service.ts + landlord.controller | 🔴 HIGH | 45 min |
| #9 | deactivate-expired-leases.job.ts + main.ts | 🔴 HIGH | 30 min |
| #10 | booking-tracking.service.ts + controller | 🟡 MEDIUM | 60 min |

**Total Time to Complete All Remaining Fixes:** ~3 hours

---

## Testing After Fixes

```typescript
// Test Fix #7: Booking to Tenant Link
const booking = await Booking.findById(bookingId);
const tenant = await NewTenant.findOne({ bookingId }); // Should find it
assert(tenant.bookingId === bookingId);

// Test Fix #8: Lease Conflict
const conflict = await checkLeaseConflict(propertyId, date1, date2);
assert(conflict.conflict === true);

// Test Fix #9: Lease Expiration
const lease = await NewTenant.findOne({ status: 'ACTIVE', moveOutDate: { $lt: today } });
assert(lease.status === 'INACTIVE'); // After cron job runs

// Test Fix #10: Email Tracking
const verified = await verifyTrackingToken(email, token);
assert(verified === true);
```

