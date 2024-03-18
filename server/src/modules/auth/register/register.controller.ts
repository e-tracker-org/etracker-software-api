import { NextFunction, Request, Response } from 'express';
import { CORS_ORIGIN, EMAIL_VERIFICATION_EXPIRES_IN } from '../../../constants';
import { sendEmail } from '../../email-service';
import { apiResponse } from '../../../utils/response';
import { signJwt } from '../login/login.utils';
import { emailFormat } from './register.email';
import { RegisterUserBody } from './register.schema';
import { createUser, findUserByEmail } from './register.service';
import { emailConfirmationLinkTemplate } from '../../../utils/email-templates';
import { User } from './register.model';
import { findById as findPropertyById } from "../../property/property.service";
import { PropertyStatus } from "../../landlord/landlord.model";
import { PropertyModel } from '../../property/property.model';

const db = require("../../../models/");

const NewTenant = db.tenant;

const NewUser = db.user;

export async function registerUserHandler(req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) {

  const { email } = req.body;

  try {
    const isUser = await findUserByEmail(email);

    if (!!isUser) {
      const { isEmailVerified } = isUser;

      if (!!isEmailVerified) {
        throw 'User already exists';
      }

      await sendEmaiLink(isUser);
    }

    const user = await createUser(req.body);

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

    // Send verification email after the user is created and the tenant is processed
    await sendEmaiLink(user);
    return apiResponse(res, 'User created and verification mail is sent successfully', user, 201);
  } catch (err) {
    next(err);
  }
}

async function updatePropertyData(propertyId: string, updatedData: any): Promise<any> {
  try {
    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      propertyId,
      updatedData,
      { new: true }
    );

    if (!updatedProperty) {
      throw 'Property not found';
    }

    return updatedProperty;
  } catch (error) {
    throw error;
  }
}


export const sendEmaiLink = async (user: any) => {
  const token = signJwt({ sub: user.email }, EMAIL_VERIFICATION_EXPIRES_IN);
  return await sendEmail(user.email, emailFormat.subject, emailConfirmationLinkTemplate(user, token));
};

