import { z } from 'zod';
import { processRequestBody } from 'zod-express-middleware';
import { TypeOf } from 'zod';

const inquiryBody = z.object({
  propertyId: z.string({ required_error: 'Property ID is required' }),
  propertyName: z.string({ required_error: 'Property name is required' }),
  landlordId: z.string({ required_error: 'Landlord ID is required' }),
  inquirerEmail: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  inquirerName: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  inquirerPhone: z.string({ required_error: 'Phone number is required' }).min(10, 'Invalid phone number'),
  message: z.string({ required_error: 'Message is required' }).min(10, 'Message must be at least 10 characters'),
});

const respondBody = z.object({
  inquiryId: z.string({ required_error: 'Inquiry ID is required' }),
  response: z.string({ required_error: 'Response is required' }).min(5, 'Response must be at least 5 characters'),
});

export const inquirySchema = {
  body: processRequestBody(inquiryBody),
};

export const respondSchema = {
  body: processRequestBody(respondBody),
};

export type InquiryBody = TypeOf<typeof inquiryBody>;
export type RespondBody = TypeOf<typeof respondBody>;
