import { z } from 'zod';
import { processRequestBody } from 'zod-express-middleware';
import { TypeOf } from 'zod';

const bookingBody = z.object({
  propertyId: z.string({ required_error: 'Property ID is required' }),
  propertyName: z.string().optional(), // Can be fetched from property
  landlordId: z.string().optional(), // Can be fetched from property
  tenantId: z.string().optional(), // Only set after account creation
  tenantEmail: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  tenantName: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  tenantPhone: z.string({ required_error: 'Phone number is required' }).min(10, 'Invalid phone number'),
  requestedMonth: z.string({ required_error: 'Requested month is required' }).regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  specialRequests: z.string().optional(),
});

const approveBookingBody = z.object({
  bookingId: z.string({ required_error: 'Booking ID is required' }),
});

const rejectBookingBody = z.object({
  bookingId: z.string({ required_error: 'Booking ID is required' }),
  reason: z.string({ required_error: 'Rejection reason is required' }).min(5, 'Reason must be at least 5 characters'),
});

export const bookingSchema = {
  body: processRequestBody(bookingBody),
};

export const approveSchema = {
  body: processRequestBody(approveBookingBody),
};

export const rejectSchema = {
  body: processRequestBody(rejectBookingBody),
};

export type BookingBody = TypeOf<typeof bookingBody>;
export type ApproveBookingBody = TypeOf<typeof approveBookingBody>;
export type RejectBookingBody = TypeOf<typeof rejectBookingBody>;
