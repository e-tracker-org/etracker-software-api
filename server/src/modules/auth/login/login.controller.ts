import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { apiError, apiResponse } from '../../../utils/response';
import { findUserByEmail } from '../register/register.service';
import { LoginBody } from './login.schema';
import { signJwt } from './login.utils';
import { attachCookie } from '../../../helpers/attachCookie';
import { comparePasswords } from '../../../helpers/comparePassword';
import { CORS_ORIGIN, EMAIL_VERIFICATION_EXPIRES_IN } from '../../../constants';
import { sendEmail } from '../../email-service';
import { emailFormat } from '../register/register.email';
import { emailConfirmationLinkTemplate } from '../../../utils/email-templates';
import { findById as findPropertyById } from '../../property/property.service';
import { PropertyStatus } from '../../landlord/landlord.model';
import { PropertyModel } from '../../property/property.model';
import { User } from '../register/register.model';

const db = require('../../../models/');
const logger = require('../../../utils/logger');

const NewTenant = db.tenant;

export async function loginHandler(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  try {
    logger.info(`[LOGIN] Attempt for email: ${email}`);
    const user = await findUserByEmail(email);

    if (!user) {
      logger.warn(`[LOGIN] User not found with email: ${email}`);
      return apiError(res, 'Invalid email or password', 401);
    }

    logger.info(`[LOGIN] User found: ${user.id} | Email verified: ${user.isEmailVerified}`);

    // Check password validity
    logger.debug(`[LOGIN] Stored password hash starts with: ${user.password?.substring(0, 3)}...`);
    const isPasswordValid = await comparePasswords(user.password, password);
    logger.info(`[LOGIN] Password valid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      logger.warn(`[LOGIN] Invalid password for user: ${user.id}`);
      return apiError(res, 'Invalid email or password', 401);
    }

    // If password is valid but not hashed, update it
    if (!user.password.startsWith('$')) {
      logger.info(`[LOGIN] Password not hashed for user ${user.id}, hashing now...`);
      user.password = await argon2.hash(password);
      await user.save();
      logger.info(`[LOGIN] Password hashed and saved for user ${user.id}`);
    }

    // Send email verification link if needed
    if (!user.isEmailVerified) {
      logger.info(`[LOGIN] Email not verified for user ${user.id}, sending verification email`);
      await sendemail(user);
      return apiResponse(res, 'Email verification mail is sent successfully', {}, 201);
    }

    logger.info(`[LOGIN] Email verified for user ${user.id}, proceeding with login`);

    const propertyId = req.body.propertyId;

    if (propertyId) {
      const property = await findPropertyById(propertyId);

      if (property) {
        // await NewUser.findByIdAndUpdate(user.id, { $push: { accountTypes: 1 } }, { new: true }); // Don't update now

        const newTenant = new NewTenant({
          userId: user.id,
          propertyId: propertyId,
          landlordId: property.current_owner,
          status: PropertyStatus.INCOMPLETE,
        });

        // Check if the tenant already exists
        const existingTenant = await NewTenant.findOne({
          userId: newTenant.userId,
          propertyId: newTenant.propertyId,
          landlordId: newTenant.landlordId,
        });

        if (existingTenant) {
          // Tenant already exists, handle accordingly (e.g., send an error response)
          console.log('Tenant already exists:', existingTenant);
          // Handle the case where the tenant already exists
        } else {
          // Save the tenant in the database if it doesn't already exist
          const tenantData = await newTenant.save();

          const updatedData = {
            tenants: [
              {
                tenantId: tenantData._id,
                status: PropertyStatus.INCOMPLETE,
              },
            ],
          };

          await updatePropertyData(propertyId, updatedData);

          // Handle successful save
          console.log('Tenant saved successfully:', tenantData);
        }
      }
    }

    const jwt = signJwt({ id: user.id, email: user.email });
    logger.info(`[LOGIN] JWT token generated for user ${user.id}`);
    attachCookie(res, jwt);

    logger.info(`[LOGIN] Login successful for user ${user.id}`);
    return apiResponse(res, 'Login successful', { tokens: jwt, user });
  } catch (err) {
    logger.error(`[LOGIN] Error during login attempt for email ${req.body.email}:`, err);
    next(err);
  }
}

async function updatePropertyData(propertyId: string, updatedData: any): Promise<any> {
  try {
    const updatedProperty = await PropertyModel.findByIdAndUpdate(propertyId, updatedData, { new: true });

    if (!updatedProperty) {
      throw 'Property not found';
    }

    return updatedProperty;
  } catch (error) {
    throw error;
  }
}

export async function loginFailureHandler(req: Request<{}, {}, {}>, res: Response) {
  return apiError(res, 'Login failure', 401);
}

export async function logoutHandler(req: Request<{}, {}, {}>, res: Response) {
  req.session.destroy(() => {});
  // Or clear the user token stored in cookies
  res.clearCookie('userLogin');

  return apiResponse(res, 'Logout successful', null);
}

const sendemail = async (user: User) => {
  const token = signJwt({ sub: user.email }, EMAIL_VERIFICATION_EXPIRES_IN);
  return sendEmail(user.email, emailFormat.subject, emailConfirmationLinkTemplate(user, token));
};
