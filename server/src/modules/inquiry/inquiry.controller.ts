import { NextFunction, Request, Response } from 'express';
import { apiResponse, apiError } from '../../utils/response';
import { InquiryBody, RespondBody } from './inquiry.schema';
import { findUserByEmail } from '../auth/register/register.service';
import { findById as findUserById } from '../profile/profile.service';
import { findById as findPropertyById } from '../property/property.service';
import {
  createInquiry,
  findInquiryById,
  findInquiriesByLandlord,
  findInquiriesByEmail,
  respondToInquiry,
  closeInquiry,
  findInquiriesByProperty,
} from './inquiry.service';
import { sendEmail } from '../email-service';
import { StatusCodes } from 'http-status-codes';

// Email template for inquiry received
const inquiryReceivedTemplate = (landlordName: string, inquirerName: string, propertyName: string, message: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Property Inquiry</h2>
      <p>Dear ${landlordName},</p>
      <p>${inquirerName} has sent an inquiry about your property <strong>${propertyName}</strong>.</p>
      <h4>Message:</h4>
      <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">${message}</p>
      <p>Please log in to your account to respond to this inquiry.</p>
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

// Email template for inquiry response
const inquiryResponseTemplate = (inquirerName: string, landlordName: string, propertyName: string, response: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Property Inquiry Response</h2>
      <p>Dear ${inquirerName},</p>
      <p>${landlordName} has responded to your inquiry about <strong>${propertyName}</strong>.</p>
      <h4>Response:</h4>
      <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #28a745;">${response}</p>
      <p>Please contact the landlord for further details.</p>
      <p>Best regards,<br>e-Tracka Team</p>
    </div>
  `;
};

export async function createInquiryHandler(
  req: Request<{}, {}, InquiryBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { propertyId, propertyName, landlordId, inquirerEmail, inquirerName, inquirerPhone, message } = req.body;

    // Validate that property exists
    const property = await findPropertyById(propertyId);
    if (!property) {
      return apiError(res, 'Property not found', StatusCodes.NOT_FOUND);
    }

    // Validate that landlord exists
    const landlord = await findUserById(landlordId);
    if (!landlord) {
      return apiError(res, 'Landlord not found', StatusCodes.NOT_FOUND);
    }

    // Create inquiry
    const inquiry = await createInquiry({
      propertyId,
      propertyName,
      landlordId,
      inquirerEmail,
      inquirerName,
      inquirerPhone,
      message,
    });

    // Send email to landlord
    try {
      await sendEmail(
        landlord.email,
        `New Property Inquiry for ${propertyName}`,
        inquiryReceivedTemplate(landlord.firstname || landlord.email, inquirerName, propertyName, message)
      );
    } catch (emailError) {
      console.error('Error sending inquiry email to landlord:', emailError);
    }

    return apiResponse(res, 'Inquiry sent successfully. Landlord will contact you soon.', inquiry, 201);
  } catch (err) {
    next(err);
  }
}

export async function respondToInquiryHandler(
  req: Request<{}, {}, RespondBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;
    const { inquiryId, response } = req.body;

    // Verify user is logged in
    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    // Find inquiry
    const inquiry = await findInquiryById(inquiryId);
    if (!inquiry) {
      return apiError(res, 'Inquiry not found', StatusCodes.NOT_FOUND);
    }

    // Verify that the user is the landlord
    if (inquiry.landlordId !== user.id) {
      return apiError(res, 'Unauthorized. You can only respond to your own inquiries.', StatusCodes.FORBIDDEN);
    }

    // Update inquiry with response
    const updatedInquiry = await respondToInquiry(inquiryId, response);

    // Send email to inquirer
    try {
      await sendEmail(
        inquiry.inquirerEmail,
        `Response to Your Inquiry about ${inquiry.propertyName}`,
        inquiryResponseTemplate(
          inquiry.inquirerName,
          user.firstname || user.email,
          inquiry.propertyName,
          response
        )
      );
    } catch (emailError) {
      console.error('Error sending response email:', emailError);
    }

    return apiResponse(res, 'Response sent successfully', updatedInquiry, 200);
  } catch (err) {
    next(err);
  }
}

export async function getInquiriesForLandlordHandler(
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
      return apiError(res, 'Only landlords can view inquiries', StatusCodes.FORBIDDEN);
    }

    const inquiries = await findInquiriesByLandlord(user.id);
    return apiResponse(res, 'Inquiries fetched successfully', inquiries, 200);
  } catch (err) {
    next(err);
  }
}

export async function getInquiriesByEmailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return apiError(res, 'Email is required', StatusCodes.BAD_REQUEST);
    }

    const inquiries = await findInquiriesByEmail(email);
    return apiResponse(res, 'Inquiries fetched successfully', inquiries, 200);
  } catch (err) {
    next(err);
  }
}

export async function getInquiriesByPropertyHandler(
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

    const inquiries = await findInquiriesByProperty(propertyId);
    return apiResponse(res, 'Inquiries fetched successfully', inquiries, 200);
  } catch (err) {
    next(err);
  }
}

export async function closeInquiryHandler(
  req: Request<{ inquiryId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = res.locals.user;
    const { inquiryId } = req.params;

    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 'User not found', StatusCodes.NOT_FOUND);
    }

    const inquiry = await findInquiryById(inquiryId);
    if (!inquiry) {
      return apiError(res, 'Inquiry not found', StatusCodes.NOT_FOUND);
    }

    // Verify authorization
    if (inquiry.landlordId !== user.id && inquiry.inquirerEmail !== user.email) {
      return apiError(res, 'Unauthorized', StatusCodes.FORBIDDEN);
    }

    const closedInquiry = await closeInquiry(inquiryId);
    return apiResponse(res, 'Inquiry closed successfully', closedInquiry, 200);
  } catch (err) {
    next(err);
  }
}
