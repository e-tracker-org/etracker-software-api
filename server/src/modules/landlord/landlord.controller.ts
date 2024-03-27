import { NextFunction, Request, Response } from 'express';
import { findAll, findUserById } from '../profile/profile.service';
import { User } from '../auth/register/register.model';
import { apiError, apiResponse } from '../../utils/response';
import { RegisterUserBody } from '../auth/register/register.schema';
import { findUserByEmail } from '../auth/register/register.service';
import { sendEmail } from '../email-service';
const { ObjectId } = require('mongodb');
import {
  emailTenantPropertyConfirmationLinkTemplate,
  inviteTenantLinkTemplate,
  sendNoticeMessageTemaplate,
  sendReceiptTemaplate,
} from '../../utils/email-templates';

import { isValid } from '../../utils/database';
import { findById } from '../profile/profile.service';
import { findById as findPropertyById } from '../property/property.service';
import { PropertyStatus, Tenant } from './landlord.model';
import { findDistinctTenant, findTenantBySearchTerm, searchLandlordTenant } from './landlord.service';
import { findTransaction } from '../transaction/transaction.service';
import { StatusCodes } from 'http-status-codes';
import { ReceiptBody } from '../receipt/receipt.schema';
import { sendReceiptEmail } from '../receipt/receipt.controller';

// New DB insert mechanism
const db = require('../../models');
const NewTenant = db.tenant;

export async function findAllTenantHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await findAll();
    let userTenants = [];
    if (users.length > 0) {
      for (const user: User of users) {
        const accountTypes: number[] = user.accountTypes || [];
        if (accountTypes.length > 0) {
          for (const accountType of accountTypes) {
            if (accountType === 1) {
              userTenants.push(user);
            }
          }
        } else return apiResponse(res, 'No Tenant found', []);
      }
      return apiResponse(res, 'Tenant list fetched successfully', userTenants);
    }
  } catch (err) {
    next(err);
  }
}

export async function searchTenantHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const searchTerm = req.query.q?.toString().trim() || '';

    const tenants = await findTenantBySearchTerm(searchTerm);
    if (!tenants) return apiResponse(res, 'No Tenant found', []);
    return apiResponse(res, 'Tenant list fetched successfully', tenants);
  } catch (err) {
    next(err);
  }
}

export async function addTenantToPropertyHandler(req: Request<{}, {}, any[]>, res: Response, next: NextFunction) {
  const { email } = res.locals.user; // Landlord email address
  if (!req.body.length) throw 'Tenant details is required';
  for (const reqDetails of req.body) {
    const { email: tenantEmail, propertyId } = reqDetails;

    // //Validate request body and params
    if (!propertyId) throw 'Property id is required';
    if (!tenantEmail) throw 'Email is required';

    try {
      //Confirm the login user email exist
      const user = await findUserByEmail(email);
      if (!user) throw 'Landlord user not found';

      // confirm the user is a landlord
      // if (!user.accountTypes.includes(2)) throw 'User not a landlord'

      //Confirm the tenant user exist
      const tenant = await findUserByEmail(tenantEmail);

      if (!tenant) throw 'Tenant user not found';

      // confirm the user is a tenant
      // if (!tenant.accountTypes.includes(1)) throw 'User not a Tenant'

      //Confirm property exist
      const property = await getProperty(propertyId);
      if (!property) throw 'Property not found';

      //Confirm the property access is not from an unknown landlord
      if (!new ObjectId(user.id).equals(property.current_owner)) throw 'Unauthorized landlord property access';

      if (property) {
        //Check  tenant exist under property
        const tenants = property.tenant.filter((tenantInfo) => tenantInfo?.tenantId === tenant?.id);

        // Add tenant to property if not exist
        if (!tenants.length) {
          property.tenant = [...property.tenant, { tenantId: tenant?.id, status: PropertyStatus.INCOMPLETE }];
          Object.assign(property, property);
          const data = await property.save();

          const newTenant = new NewTenant({
            userId: user.id,
            propertyId: property.id,
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
                newTenant
                  .save()
                  .then((tenantData: any) => {
                    // Handle successful save
                    console.log('Tenant saved successfullys:', tenantData);
                  })
                  .catch((err: { message: any }) => {
                    // Handle save error
                    console.error('Error saving tenant:', err.message);
                  });
              }
            })
            .catch((err: { message: any }) => {
              // Handle query error
              console.error('Error checking for existing tenant:', err.message);
            });
        }

        // Prepare email info
        tenant.address = property.address;
        tenant.tenantId = tenant?.id;
        tenant.propertyId = propertyId;

        //Send tenant property confirmation email
        await sendEmaiLink(user, tenant);
        return apiResponse(res, 'Property Confirmation email sent.', '', 201);
      } else {
        throw 'Property not found';
      }
    } catch (err) {
      next(err);
    }
  }
}

export async function confirmTenantPropertyHandler(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response,
  next: NextFunction
) {
  const { tenantId, propertyId } = req.body;
  const { email } = res.locals.user;
  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';
    console.log('UserTenant>>>', user);
    // confirm the user is a tenant (1 represent tenant in the db)
    if (!user.accountTypes.includes(1)) throw 'User not a Tenant';

    //Validate request params
    if (!tenantId) throw 'Tenant id is required';
    if (!propertyId) throw 'Property id is required';

    //Validate tenantId is the logged in user
    if (user.id !== tenantId) throw 'Invalid tenant id';

    //Confirm property exist
    const property = await getProperty(propertyId);
    if (!property) throw 'Property not found';

    // //Confirm the property access is not from an unknown landlord
    // if(!(new ObjectId(user.id)).equals(property.current_owner)) throw 'Unauthorized landlord property access'

    if (property) {
      //Validate tenant  exist
      const propertyTenant = property.tenant.find((tenant) => tenant.tenantId === tenantId);
      if (!propertyTenant) throw 'This tenant does not exist under this property';

      // Confirm status is not COMPLETE
      if (propertyTenant.status === PropertyStatus.COMPLETE) throw 'Tenant already added to this property';

      // Update tenant status to complete
      propertyTenant.status = PropertyStatus.COMPLETE;
      propertyTenant.isActive = true;

      //Confirm tenant to property
      const index = property.tenant.findIndex((tenant) => tenant.tenantId === tenantId);
      if (!(index !== -1)) throw `Tenant with the provided ${tenantId} does not exist `;
      if (index !== -1) property.tenant[index] = propertyTenant;

      Object.assign(property, property);
      const data = await property.save();

      return apiResponse(res, `Tenant successfully added to property ${property.name}`, data, 201);
    } else {
      throw 'Property not found';
    }
  } catch (err) {
    next(err);
  }
}

export async function findLandlordTenantHandler(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response,
  next: NextFunction
) {
  const { email } = res.locals.user;
  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';

    // confirm the user is a landlord (2 represent landlord in the db)
    if (!user.accountTypes.includes(2)) throw 'User not a Landlord';
    // Fetch all tenant IDs from the properties collection
    const nonEmptyTenantIds = await findDistinctTenant('tenant', user.id);

    // Validate if any tenant exist
    if (!nonEmptyTenantIds.length) throw 'No tenant found';

    // Filter out empty tenant IDs
    // const nonEmptyTenantIds = tenants.filter((tenant) => Array.isArray(tenant) && tenant.length > 0);
    const tenantProfiles = [];

    // Find profiles associated with each non-empty tenant ID
    for (const tenant: Tenant of nonEmptyTenantIds) {
      //tenant.isActive confirms the tenant is active under this tenant
      if (tenant.isActive) {
        const profile = await findById(tenant.tenantId);
        // console.log(`Profiles for tenant ID ${tenant.tenantId}:`, profiles);
        if (profile) {
          profile.propertyApprovalStatus = tenant.status;
          tenantProfiles.push(profile);
        }
      }
    }
    return apiResponse(res, `Tenants successfully fetched`, tenantProfiles, 201);
  } catch (err) {
    next(err);
  }
}

export async function searchLandlordTenantHandler(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response,
  next: NextFunction
) {
  const { email } = res.locals.user;
  const propertyId = req.query.q?.toString().trim() || '';
  const searchTerm = req.query.q1?.toString().trim() || '';

  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';

    // confirm the user is a landlord (2 represent landlord in the db)
    if (!user.accountTypes.includes(2)) throw 'User not a Landlord';
    if (propertyId) {
      //Confirm this landlord user owns the property he wants to search tenant
      const property = await findPropertyById(propertyId);
      if (!propertyId) throw 'Property not found';
      //Confirm the property access is not from an unknown landlord
      if (!new ObjectId(user.id).equals(property.current_owner)) throw 'Unauthorized landlord property access';
    }
    const tenants = await searchLandlordTenant({ propertyId, searchTerm, userId: user.id });

    return apiResponse(res, `Tenants successfully fetched`, tenants, 201);
  } catch (err) {
    next(err);
  }
}

export async function inviteTenantHandler(req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) {
  const { email } = res.locals.user; // Landlord email address
  try {
    //Confirm the login user email exist
    const user = await findUserByEmail(email);
    if (!user) throw 'Landlord user not found';
    if (!req.body.email) throw 'Email is required';

    //Confirm if invite email already exist
    const emailExist = await findUserByEmail(req.body.email);
    if (emailExist) throw 'User already exist on this platform';

    // confirm the user is a landlord
    if (!user.accountTypes.includes(2)) throw 'User not a landlord';

    //Send invite tenant email link
    await sendInviteTenantEmailLink(req.body.email);
    return apiResponse(res, `Email invitation sent to ${req.body.email}`, '', 201);
  } catch (err) {
    next(err);
  }
}

export async function endTenantAgreementHandler(req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;
  const { propertyId, tenantId } = req.body;

  if (!propertyId) throw 'Property id is required';
  if (!tenantId) throw 'Tenant id is required';

  try {
    // Confirm logged in user exists
    const user = await findUserByEmail(email);
    if (!user) throw apiError(res, `User not found`, StatusCodes.NOT_FOUND);

    // Confirm the user is a landlord
    if (!user.accountTypes.includes(2)) apiError(res, `User is not a landlord`, StatusCodes.NOT_FOUND);

    const tenant = await findById(tenantId);
    const property = await findPropertyById(propertyId);

    if (!tenant) apiError(res, `Invalid tenant id`, StatusCodes.BAD_REQUEST);
    if (!property) apiError(res, `Invalid property id`, StatusCodes.BAD_REQUEST);

    if (!tenant.accountTypes.includes(1)) apiError(res, `Kyc not completed`, StatusCodes.BAD_REQUEST);

    const propertyTenantIndex = property.tenant.findIndex((propertyTenant) => propertyTenant.tenantId === tenantId);
    if (propertyTenantIndex === -1) {
      apiError(
        res,
        `Tenant with the provided ${tenantId} does not exist under this landlord's property `,
        StatusCodes.NOT_FOUND
      );
    }

    const propertyTenant = property.tenant[propertyTenantIndex];
    if (!propertyTenant.isActive) {
      // Remove tenant from property's tenant list
      property.tenant.splice(propertyTenantIndex, 1);
      const data = await property.save();

      return apiResponse(res, `Tenant agreement for ${property.name} property successfully ended`, null, 201);
    }

    return apiError(
      res,
      `Tenant agreement under ${property.name} property is not active`,
      StatusCodes.EXPECTATION_FAILED
    );
  } catch (err) {
    next(err);
  }
}

export async function notifyTenantHandler(req: Request<{}, {}, ReceiptBody>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;
  const { tenantIds, notifyMsg } = req.body;

  if (!notifyMsg) return apiError(res, `Notification message required`, StatusCodes.BAD_REQUEST);
  if (tenantIds.length < 1) return apiError(res, `Tenant id is required`, StatusCodes.BAD_REQUEST);

  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) return apiError(res, `User not found`, StatusCodes.NOT_FOUND);

    // confirm the user is either  landlord
    if (!user.accountTypes.includes(2)) return apiError(res, `User is not a landlord`, StatusCodes.NOT_FOUND);

    const firstname = user.firstname;
    const lastname = user.lastname;
    for (const tenantId of tenantIds) {
      const tenant = await findById(tenantId);
      if (tenant && tenant.accountTypes.includes(1)) {
        await sendNotifyTenantEmailLink(tenant.email, notifyMsg, firstname, lastname, tenant.firstname);
      }
    }
    return apiResponse(res, `Email notification message successfully sent`, null, 201);
  } catch (err) {
    next(err);
  }
}

export const sendInviteTenantEmailLink = async (email: string) => {
  return await sendEmail(
    email,
    'Join e-Tracka Platform - Your Smart Property Management Solution',
    inviteTenantLinkTemplate()
  );
};
export const sendNotifyTenantEmailLink = async (
  email: string,
  notifyMsg: string,
  firstName: string,
  lastName: string,
  name: string
) => {
  const subject = `Message From ${firstName} ${lastName}`; // Subject with landlord's first name and last name
  return await sendEmail(email, subject, sendNoticeMessageTemaplate(notifyMsg, name));
};

export const sendEmaiLink = async (user: any, tenant: any) => {
  return await sendEmail(
    tenant.email,
    'Confirm Your Property Allocation',
    emailTenantPropertyConfirmationLinkTemplate(user, tenant)
  );
};

async function getProperty(propertyId: string) {
  if (!isValid(propertyId)) throw 'Invalid Property ID';
  const property = await findPropertyById(propertyId);
  if (!property) throw 'Property not found';
  return property;
}
