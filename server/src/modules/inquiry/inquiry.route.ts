import express from 'express';
import { inquirySchema, respondSchema } from './inquiry.schema';
import requireUser from '../../middleware/requireUser';
import {
  createInquiryHandler,
  respondToInquiryHandler,
  getInquiriesForLandlordHandler,
  getInquiriesByEmailHandler,
  getInquiriesByPropertyHandler,
  closeInquiryHandler,
} from './inquiry.controller';

const router = express.Router();

// Public endpoint - anyone can inquire about a property
router.post('/create', inquirySchema.body, createInquiryHandler);

// Get inquiries by email (public)
router.get('/inquirer/:email', getInquiriesByEmailHandler);

// Get inquiries for a property (public)
router.get('/property/:propertyId', getInquiriesByPropertyHandler);

// Landlord endpoints - require authentication
router.get('/my-inquiries', requireUser, getInquiriesForLandlordHandler);
router.patch('/respond', requireUser, respondSchema.body, respondToInquiryHandler);
router.patch('/close/:inquiryId', requireUser, closeInquiryHandler);

export default router;
