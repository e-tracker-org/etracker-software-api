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
import {findById as findPropertyById} from "../../property/property.service";
import {PropertyStatus} from "../../landlord/landlord.model";

const db = require("../../models");
const NewTenant = db.tenant;

export async function registerUserHandler(req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) {
  const {email} = req.body
  try {
    const isUser = await findUserByEmail(email);
    if (!!isUser) {
      const {isEmailVerified} = isUser
      if (!!isEmailVerified) throw 'User already exist';
      await sendEmaiLink(isUser);
      return apiResponse(res, 'Click on the verification link sent to your email to complete your account creation', {}, 201);
    }

    const user = await createUser(req.body);
    const propertyId = req.body.propertyId;
    if(propertyId){
      const property = await findPropertyById(propertyId);
      if (property){
      const newTenant = new NewTenant({
        userId: user.id,
        propertyId: propertyId,
        landlordId: property.current_owner,
        status: PropertyStatus.INCOMPLETE,
      });
      
      // Check if the tenant already exists
      NewTenant.findOne({
        userId: newTenant.userId,
        propertyId: newTenant.propertyId,
        landlordId: newTenant.landlordId,
      })
        .then((existingTenant: any) => {
          if (existingTenant) {
            // Tenant already exists, handle accordingly (e.g., send an error response)
            console.log('Tenant already exists:', existingTenant);
            // Handle the case where the tenant already exists
          } else {
            // Save the tenant in the database if it doesn't already exist
            newTenant.save()
              .then((tenantData: any) => {
                // Handle successful save
                console.log('Tenant saved successfullys:', tenantData);
              })
              .catch((err: { message: any; })  => {
                // Handle save error
                console.error('Error saving tenant:', err.message);
              });
          }
        })
        .catch((err: { message: any; }) => {
          // Handle query error
          console.error('Error checking for existing tenant:', err.message);
        });

    }
  }
    await sendEmaiLink(user);
    return apiResponse(res, 'User created and verification mail is sent successfully', user, 201);
  } catch (err) {
    next(err);
  }
}

export const sendEmaiLink = async (user: any) => {
  const token = signJwt({ sub: user.email }, EMAIL_VERIFICATION_EXPIRES_IN);
  return await sendEmail(user.email, emailFormat.subject, emailConfirmationLinkTemplate(user, token));
};
