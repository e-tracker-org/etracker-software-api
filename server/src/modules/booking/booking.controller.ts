import { NextFunction, Request, Response } from 'express';
import { apiResponse, apiError } from '../../utils/response';
import { BookingBody, ApproveBookingBody, RejectBookingBody } from './booking.schema';
import { findUserByEmail } from '../auth/register/register.service';
import { findById as findUserById } from '../profile/profile.service';
import { findById as findPropertyById } from '../property/property.service';
import {
  createBooking,
  findBookingById,
  findBookingsByLandlord,
  findBookingsByTenant,
  findBookingsByProperty,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from './booking.service';
import { sendEmail } from '../email-service';
import { sendTrackingLink } from './booking-tracking.service'; // ✅ FIX #10: Import tracking service
import { StatusCodes } from 'http-status-codes';

// Email templates
const bookingRequestTemplate = (landlordName: string, tenantName: string, propertyName: string, requestedMonth: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Property Application</h2>
      <p>Dear ${landlordName},</p>
      <p>${tenantName} has submitted an application to occupy your property <strong>${propertyName}</strong>.</p>
      <p><strong>Requested Month:</strong> ${requestedMonth}</p>
      <p>Please log in to your account to approve or reject this application. Once approved, you can set the exact move-in date after confirming payment details with the tenant.</p>
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

const bookingApprovedTemplate = (tenantName: string, propertyName: string, landlordName: string, moveInDate?: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Application Approved</h2>
      <p>Dear ${tenantName},</p>
      <p>Congratulations! Your application for <strong>${propertyName}</strong> has been approved by ${landlordName}.</p>
      ${moveInDate ? `<p><strong>Move-in Date:</strong> ${new Date(moveInDate).toLocaleDateString()}</p>` : '<p>The landlord will contact you shortly to confirm the exact move-in date and next steps.</p>'}
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

const bookingRejectedTemplate = (tenantName: string, propertyName: string, reason: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Application Rejected</h2>
      <p>Dear ${tenantName},</p>
      <p>Unfortunately, your application for <strong>${propertyName}</strong> has been rejected.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please feel free to explore other properties or contact the landlord for more information.</p>
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

export async function createBookingHandler(
  req: Request<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { propertyId, tenantEmail, tenantName, tenantPhone, requestedMonth, specialRequests } = req.body;

    // Validate that property exists
    const property = await findPropertyById(propertyId);
    if (!property) {
      return apiError(res, 'Property not found', StatusCodes.NOT_FOUND);
    }

    // ✅ AUTO-FETCH: Get landlordId and propertyName from property
    const landlordId = (property.current_owner?.toString() || property.created_by?.toString()) as string;
    const propertyName = property.name;

    // Validate that landlord exists
    const landlord = await findUserById(landlordId);
    if (!landlord) {
      return apiError(res, 'Landlord not found', StatusCodes.NOT_FOUND);
    }

    // ✅ NEW: Validate property is available
    if (property.availability !== 'AVAILABLE') {
      return apiError(res, `Property is currently ${property.availability}`, StatusCodes.CONFLICT);
    }

    // ✅ NEW: Validate requestedMonth is in future
    const requestedDate = new Date(`${requestedMonth}-01`);
    if (requestedDate <= new Date()) {
      return apiError(res, 'Requested month must be in the future', StatusCodes.BAD_REQUEST);
    }

    // Create booking with requestedMonth (no tenantId required upfront)
    const booking = await createBooking({
      propertyId,
      propertyName,
      landlordId,
      tenantEmail,
      tenantName,
      tenantPhone,
      requestedMonth,
      specialRequests,
    });

    // Send email to landlord
    try {
      await sendEmail(
        landlord.email,
        `New Property Application for ${propertyName}`,
        bookingRequestTemplate(landlord.firstname || landlord.email, tenantName, propertyName, requestedMonth)
      );
    } catch (emailError) {
      console.error('Error sending booking email to landlord:', emailError);
    }

    return apiResponse(res, 'Application submitted successfully. Landlord will review and respond.', booking, 201);
  } catch (err) {
    next(err);
  }
}

export async function approveBookingHandler(
  req: Request<{}, {}, ApproveBookingBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;
    const { bookingId } = req.body;

    // Verify user is logged in
    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    // Find booking
    const booking = await findBookingById(bookingId);
    if (!booking) {
      return apiError(res, 'Application not found', StatusCodes.NOT_FOUND);
    }

    // Verify that the user is the landlord
    if (booking.landlordId !== user.id) {
      return apiError(res, 'Unauthorized. You can only approve your own applications.', StatusCodes.FORBIDDEN);
    }

    // Approve booking
    const approvedBooking = await approveBooking(bookingId);

    // Send email to tenant
    try {
      await sendEmail(
        booking.tenantEmail,
        `Application Approved for ${booking.propertyName}`,
        bookingApprovedTemplate(booking.tenantName, booking.propertyName, user.firstname || user.email)
      );
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    return apiResponse(res, 'Application approved successfully', approvedBooking, 200);
  } catch (err) {
    next(err);
  }
}

export async function rejectBookingHandler(
  req: Request<{}, {}, RejectBookingBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;
    const { bookingId, reason } = req.body;

    // Verify user is logged in
    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    // Find booking
    const booking = await findBookingById(bookingId);
    if (!booking) {
      return apiError(res, 'Application not found', StatusCodes.NOT_FOUND);
    }

    // Verify that the user is the landlord
    if (booking.landlordId !== user.id) {
      return apiError(res, 'Unauthorized. You can only reject your own applications.', StatusCodes.FORBIDDEN);
    }

    // Reject booking
    const rejectedBooking = await rejectBooking(bookingId, reason);

    // Send email to tenant
    try {
      await sendEmail(
        booking.tenantEmail,
        `Application Rejected for ${booking.propertyName}`,
        bookingRejectedTemplate(booking.tenantName, booking.propertyName, reason)
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    return apiResponse(res, 'Application rejected successfully', rejectedBooking, 200);
  } catch (err) {
    next(err);
  }
}

export async function getBookingsForLandlordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;

    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    // Verify user is a landlord
    if (!user.accountTypes || !user.accountTypes.includes(2)) {
      return apiError(res, 'Only landlords can view applications', StatusCodes.FORBIDDEN);
    }

    const bookings = await findBookingsByLandlord(user.id);
    return apiResponse(res, 'Applications fetched successfully', bookings, 200);
  } catch (err) {
    next(err);
  }
}

export async function getBookingsByTenantEmailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return apiError(res, 'Email is required', StatusCodes.BAD_REQUEST);
    }

    const bookings = await findBookingsByTenant(email);
    return apiResponse(res, 'Applications fetched successfully', bookings, 200);
  } catch (err) {
    next(err);
  }
}

export async function getBookingsByPropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return apiError(res, 'Property ID is required', StatusCodes.BAD_REQUEST);
    }

    // Verify property exists
    const property = await findPropertyById(propertyId);
    if (!property) {
      return apiError(res, 'Property not found', StatusCodes.NOT_FOUND);
    }

    const bookings = await findBookingsByProperty(propertyId);
    return apiResponse(res, 'Applications fetched successfully', bookings, 200);
  } catch (err) {
    next(err);
  }
}

export async function cancelBookingHandler(
  req: Request<{ bookingId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;
    const { bookingId } = req.params;

    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    const booking = await findBookingById(bookingId);
    if (!booking) {
      return apiError(res, 'Application not found', StatusCodes.NOT_FOUND);
    }

    // Verify authorization - only tenant or landlord can cancel
    if (booking.tenantEmail !== user.email && booking.landlordId !== user.id) {
      return apiError(res, 'Unauthorized', StatusCodes.FORBIDDEN);
    }

    const cancelledBooking = await cancelBooking(bookingId);
    return apiResponse(res, 'Application cancelled successfully', cancelledBooking, 200);
  } catch (err) {
    next(err);
  }
}
