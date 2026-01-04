import express from 'express';
import { bookingSchema, approveSchema, rejectSchema } from './booking.schema';
import requireUser from '../../middleware/requireUser';
import {
  createBookingHandler,
  approveBookingHandler,
  rejectBookingHandler,
  getBookingsForLandlordHandler,
  getBookingsByTenantEmailHandler,
  getBookingsByPropertyHandler,
  cancelBookingHandler,
} from './booking.controller';
import {
  createTenantAccountFromBookingHandler,
  getPendingApprovalsHandler,
} from './booking-tenant-creation.controller';

const router = express.Router();

// Public endpoint - anyone can make a booking request
router.post('/create', bookingSchema.body, createBookingHandler);

// Get bookings by tenant email (public)
router.get('/tenant/:email', getBookingsByTenantEmailHandler);

// Get bookings for a property (public)
router.get('/property/:propertyId', getBookingsByPropertyHandler);

// Landlord endpoints - require authentication
router.get('/my-bookings', requireUser, getBookingsForLandlordHandler);
router.patch('/approve', requireUser, approveSchema.body, approveBookingHandler);
router.patch('/reject', requireUser, rejectSchema.body, rejectBookingHandler);
router.patch('/cancel/:bookingId', requireUser, cancelBookingHandler);

// ✅ FIX #4: Landlord creates tenant account from approved booking
router.post('/create-tenant-account', requireUser, createTenantAccountFromBookingHandler);
router.get('/pending-approvals-info', requireUser, getPendingApprovalsHandler);

export default router;
