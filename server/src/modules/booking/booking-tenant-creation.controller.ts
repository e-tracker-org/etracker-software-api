import { NextFunction, Request, Response } from 'express';
import { apiResponse, apiError } from '../../utils/response';
import { findUserByEmail, createUser } from '../auth/register/register.service';
import { findBookingById, updateBooking } from './booking.service';
import { findById as findPropertyById } from '../property/property.service';
import { findById as findUserById } from '../profile/profile.service';
import { sendEmail } from '../email-service';
import { StatusCodes } from 'http-status-codes';

/**
 * ✅ FIX #4: Create tenant account endpoint
 * When landlord approves a booking, create user account for the applicant
 * This bridges the gap from public application to registered tenant
 */

const tenantWelcomeTemplate = (
  tenantName: string,
  propertyName: string,
  moveInDate: string,
  landlordName: string,
  email: string,
  password: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to e-Tracka!</h2>
      <p>Dear ${tenantName},</p>
      <p>Congratulations! Your application for <strong>${propertyName}</strong> has been approved by ${landlordName}.</p>
      
      <h3>Your Account Details</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password} (Please change this after first login)</p>
      
      <h3>Lease Information</h3>
      <p><strong>Property:</strong> ${propertyName}</p>
      <p><strong>Estimated Move-in Date:</strong> ${moveInDate}</p>
      <p>The landlord will contact you shortly with exact lease dates and payment schedule.</p>
      
      <h3>Next Steps</h3>
      <ol>
        <li>Log in to your account with the credentials above</li>
        <li>Update your profile if needed</li>
        <li>Watch for notifications from your landlord</li>
        <li>Review and approve lease terms when ready</li>
      </ol>
      
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

interface CreateTenantAccountBody {
  bookingId: string;
  password?: string; // Optional - generate if not provided
}

export async function createTenantAccountFromBookingHandler(
  req: Request<{}, {}, CreateTenantAccountBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email: landlordEmail } = res.locals.user; // Must be landlord
    const { bookingId, password } = req.body;

    // 1. Validate landlord is logged in
    const landlord = await findUserByEmail(landlordEmail);
    if (!landlord) {
      return apiError(res, 'Landlord not found', StatusCodes.NOT_FOUND);
    }

    // 2. Verify landlord is actually a landlord
    if (!landlord.accountTypes?.includes(2)) {
      return apiError(res, 'Only landlords can create tenant accounts', StatusCodes.FORBIDDEN);
    }

    // 3. Find booking
    const booking = await findBookingById(bookingId);
    if (!booking) {
      return apiError(res, 'Application not found', StatusCodes.NOT_FOUND);
    }

    // 4. Verify this is the landlord's booking
    if (booking.landlordId !== landlord.id) {
      return apiError(res, 'Unauthorized. This is not your application.', StatusCodes.FORBIDDEN);
    }

    // 5. Verify booking is approved
    if (booking.status !== 'APPROVED') {
      return apiError(res, 'Only approved applications can become tenants', StatusCodes.BAD_REQUEST);
    }

    // 6. Check if user already exists
    const existingUser = await findUserByEmail(booking.tenantEmail);
    if (existingUser) {
      return apiError(res, 'User account already exists with this email', StatusCodes.CONFLICT);
    }

    // 7. Create password (generate if not provided)
    const finalPassword = password || Math.random().toString(36).slice(-8) + 'Aa1!';

    // 8. Create user account
    const newUser = await createUser({
      email: booking.tenantEmail,
      firstname: booking.tenantName,
      lastname: booking.tenantName, // Use same name for last name if not provided
      phone: booking.tenantPhone,
      password: finalPassword,
      confirmPassword: finalPassword, // Required field
      accountTypes: [1], // Tenant account type
    });

    // 9. Update booking with tenantId
    const updatedBooking = await updateBooking(bookingId, {
      tenantId: newUser.id,
    });

    // 10. Send welcome email to tenant
    try {
      await sendEmail(
        booking.tenantEmail,
        `Welcome to e-Tracka - Your Account is Ready!`,
        tenantWelcomeTemplate(
          booking.tenantName,
          booking.propertyName,
          booking.requestedMonth,
          landlord.firstname || landlord.email,
          booking.tenantEmail,
          finalPassword
        )
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return apiResponse(
      res,
      `Tenant account created successfully. Welcome email sent to ${booking.tenantEmail}`,
      {
        userId: newUser.id,
        email: newUser.email,
        booking: updatedBooking,
      },
      StatusCodes.CREATED
    );
  } catch (err) {
    next(err);
  }
}

/**
 * ✅ HELPER: Get approval URL for pending applications
 * Used in dashboard to show which bookings can be converted to tenants
 */
export async function getPendingApprovalsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;

    const landlord = await findUserByEmail(email);
    if (!landlord || !landlord.accountTypes?.includes(2)) {
      return apiError(res, 'Only landlords can view this', StatusCodes.FORBIDDEN);
    }

    // This endpoint just provides UI guidance
    return apiResponse(
      res,
      'To create a tenant account from an approved application:',
      {
        step1: 'Review the approved application in your dashboard',
        step2: 'Click "Create Tenant Account"',
        step3: `Send POST to /api/v1/booking/create-tenant-account with:
                {
                  "bookingId": "APPLICATION_ID",
                  "password": "optional_password"
                }`,
        step4: 'Tenant receives welcome email with login credentials',
      },
      StatusCodes.OK
    );
  } catch (err) {
    next(err);
  }
}
