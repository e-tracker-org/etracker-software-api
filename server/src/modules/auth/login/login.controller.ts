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

const NewTenant = db.tenant;

export async function loginHandler(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user || !(await comparePasswords(user.password, password))) {
      return apiError(res, 'Invalid email or password', 401);
    }
    // Send email verification link if isEmailVerified is false
    if (!user.isEmailVerified) {
      await sendemail(user);
      return apiResponse(res, 'Email verification mail is sent successfully', {}, 201);
    }

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
    attachCookie(res, jwt);

    return apiResponse(res, 'Login successful', { tokens: jwt, user });
  } catch (err) {
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
