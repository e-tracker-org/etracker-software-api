import { NextFunction, Request, Response } from 'express';
import {findAll} from "../profile/profile.service";
import {User} from "../auth/register/register.model";
import {apiError, apiResponse} from "../../utils/response";
import {RegisterUserBody} from "../auth/register/register.schema";
import {createUser, findUserByEmail} from "../auth/register/register.service";
import {sendEmail} from "../email-service";
import {emailConfirmationLinkTemplate, emailTenantPropertyConfirmationLinkTemplate} from "../../utils/email-templates";

import {isValid} from "../../utils/database";
import {findById, findByUserId} from "../property/property.service";
import {PropertyStatus} from "./tenant.model";
import {Property} from "../property/property.model";

export async function findAllTenantHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await findAll();
    let userTenants = [];
    if(users.length > 0) {
      for (const user: User of users) {
        const accountTypes: number[] = user.accountTypes || [];
        if(accountTypes.length > 0) {
          for (const accountType of accountTypes) {
            if(accountType === 1) {
              userTenants.push(user)
            }
          }
        } else throw 'No Tenant found'
      }
      return apiResponse(res, 'Tenant list fetched successfully', userTenants);
    }
  } catch (err) {
    next(err);
  }
}
export async function findLandlordTenantHandler(req: Request, res: Response, next: NextFunction) {
  //Confirm the logged in user exist
  const user = await findUserByEmail(res.locals.user.email);
  if (!user) next('User not found');
  //Confirm he's an approved agent;
  const accountTypes: number[] = user.accountTypes || [];
  if(accountTypes.length > 0 && accountTypes.includes(2)) {
    // Get property that belongs to current owner
    const properties: Array<Property> = await findByUserId(user.id);
  }else {
    // not an approved agent
  }



  try {
    const users = await findAll();
    let userTenants = [];
    if(users.length > 0) {
      for (const user: User of users) {
        const accountTypes: number[] = user.accountTypes || [];
        if(accountTypes.length > 0) {
          for (const accountType of accountTypes) {
            if(accountType === 1) {
              userTenants.push(user)
            }
          }
        }
      }
      return apiResponse(res, 'Tenant list fetched successfully', userTenants);
    }
  } catch (err) {
    next(err);
  }
}

export async function addTenantToProperty(req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) {
  const {email: tenantEmail,  address} = req.body
  const { tenantId, propertyId} = req.params;
  const { email } = res.locals.user;
  try {
    //Confirm the login user email exist
    const user = await findUserByEmail(email);
    if(!user)  throw 'Landlord user not found';

    // confirm the user is a landlord
    if(!user.accountTypes.includes(2)) throw 'User not a landlord'

    //Validate request body and params
    if(!tenantId) throw 'Tenant id is required';
    if(!propertyId) throw 'Property id is required';
    if(!address) throw 'Address field is required';

    //Confirm the tenant user exist
    const tenant = await findUserByEmail(tenantEmail);
    if(!tenant) throw 'Tenant user not found';

    // confirm the user is a tenant
    if(!tenant.accountTypes.includes(1)) throw 'User not a Tenant'


    //Confirm property exist
    const property = await getProperty(propertyId);
    if(!property) throw 'Property not found';

    if(property) {
      //Validate that tenant exist under that property already
      const tenants = property.tenant.filter(tenant => tenant.tenantId === tenantId);
      if(tenants.length > 0) {
        throw `Tenant already added to ${property?.name} property`;
      }
      // Add tenant to property
      property.tenant.push({tenantId, status: PropertyStatus.INCOMPLETE})
      Object.assign(property, property);
      const data = await property.save();

      // Prepare email info
      tenant.address = address;
      tenant.tenantId = tenantId;
      tenant.propertyId = propertyId;

      //Send tenant property confirmation email
      await sendEmaiLink(user, tenant);
      return apiResponse(res, 'Property Confirmation email sent.', data, 201);
    } else {
      throw "Property not found";
    }
  } catch (err) {
    next(err);
  }
}

export async function confirmTenantProperty(req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) {
  const { tenantId, propertyId} = req.params;
  const { email } = res.locals.user;
  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if(!user) throw 'User not found';

    // confirm the user is a tenant (1 represent tenant in the db)
    if(!user.accountTypes.includes(1)) throw 'User not a Tenant'

    //Validate request params
    if(!tenantId) throw 'Tenant id is required';
    if(!propertyId) throw 'Property id is required';

    //Validate tenantId is the logged in user
    if(user.id !== tenantId) throw 'Invalid tenant id'

    //Confirm property exist
    const property = await getProperty(propertyId);
    if(!property) throw 'Property not found';

    if(property) {

      //Validate tenant  exist
      const propertyTenant = property.tenant.find(tenant => tenant.tenantId === tenantId);
      if(!propertyTenant) throw 'This tenant does not exist under this property';

      // Confirm status is not COMPLETE
      if(propertyTenant.status === PropertyStatus.COMPLETE) throw 'Tenant already added to this property';

      // Update tenant status to complete
      propertyTenant.status = PropertyStatus.COMPLETE

      //Confirm tenant to property
      const index = property.tenant.findIndex(tenant => tenant.tenantId === tenantId);
      if(!(index !== -1)) throw `Tenant with the provided ${tenantId} does not exist `
      if (index !== -1) property.tenant[index] = propertyTenant;

      Object.assign(property, property);
      const data = await property.save();

      return apiResponse(res, `Tenant successfully added to property ${property.name}`, data, 201);
    } else {
      throw "Property not found";
    }
  } catch (err) {
    next(err);
  }

}

export const sendEmaiLink = async (user: any, tenant: any) => {
  return await sendEmail(tenant.email, "Confirm Your Property Allocation", emailTenantPropertyConfirmationLinkTemplate(user, tenant));
};

async function getProperty(id: string) {
  if (!isValid(id)) throw 'Invalid Property ID';
  const property = await findById(id);
  if (!property) throw 'Property not found';
  return property;
}
