import { User, UserModel } from '../auth/register/register.model';
import {PropertyModel} from "../property/property.model";
import {PropertyStatus} from "./landlord.model";
const { ObjectId } = require('mongodb');

export async function findAllUser() {
  return await UserModel.find();
}


// export async function findTenantBySearchTerm(searchTerm: RegExp) {
//
//   // Build the filter query
//   const filter = {
//     accountTypes: { $in: [1] },
//     $or: [
//       { firstname: { $regex: searchTerm, $options: 'i' } },
//       { lastname: { $regex: searchTerm, $options: 'i' } },
//       { email: { $regex: searchTerm, $options: 'i' } },
//     ],
//   };
//   return await UserModel.find(filter);
// }

export async function findTenantBySearchTerm(searchTerm: string) {
  const tenantIds: any[] =  await findTenantIds(searchTerm);
  const tenantIdNoObj: any[] = tenantIds.map(id => id.toString());
  const propertyQuery = {
    tenant: {
      $elemMatch: {
        tenantId: { $in: tenantIdNoObj },
        status: 'COMPLETE',
      },
    },
  };
  // Find all properties that match the search criteria and project only the tenantId field
  const propertyTenants: any = await PropertyModel.aggregate([
    { $match: propertyQuery },
    { $unwind: '$tenant' },
    {
      $match: {
        'tenant.tenantId': { $in: tenantIdNoObj },
        'tenant.status': 'COMPLETE',
      },
    },
    {
      $group: {
        _id: '$tenant.tenantId',
        tenant: { $first: '$tenant' },
      },
    },
    {
      $project: {
        _id: 0,
        tenantId: '$_id',
      },
    },
  ]);

  // Remove the tenantIds from the already added tenants that has confirmed link
  const filteredTenantIds = tenantIds.filter(tenantId => !propertyTenants.includes(tenantId));

  // Find UserModel documents filtered tenant details
  const tenants = await UserModel.find({ _id: { $in: filteredTenantIds }});
  console.log('propertyTenants>>>', tenants)

  return tenants;

}

export async function findDistinctTenant(field: string, userId: string ) {
  return await PropertyModel.distinct(field, { current_owner: userId });
}

export async function searchLandlordTenant(searchQuery: {propertyId: string; searchTerm: string, userId: string}) {

  const { propertyId, searchTerm, userId } = searchQuery;
  const searchRegex = new RegExp(searchTerm, 'i');
  const landLordId = new ObjectId(userId)
  const propertiesId = propertyId ? new ObjectId(propertyId) : ''

  let propertyQuery = {};
  const tenantIds: any[] =  await findTenantIds(searchTerm);
  const tenantIdNoObj: any[] = tenantIds.map(id => id.toString())

  if (propertyId && searchTerm) {
    // Search by property ID and search term
    propertyQuery = {
      _id: propertiesId,
      current_owner: landLordId,
      tenant: {
        $elemMatch: {
          tenantId: { $in: tenantIdNoObj },
          isActive: true
        },
      },
    };
  } else if (propertyId) {
    // Search by property ID only
    propertyQuery = {
      _id: propertiesId,
      current_owner: landLordId,
      tenant: {
        $elemMatch: {
          tenantId: { $in: tenantIdNoObj },
          isActive: true
        },
      },

    };
  } else if (searchTerm) {
    // Search by search term only
     propertyQuery = {
      current_owner: landLordId,
      tenant: {
        $elemMatch: {
          tenantId: { $in: tenantIdNoObj },
          isActive: true
        },
      },
    };
  } else {
    propertyQuery = {
      current_owner: landLordId,
      tenant: {
        $elemMatch: {
          isActive: true
        },
      },
    }
  }
  // Find all properties that match the search criteria
  const propertyTenants: any = await PropertyModel.aggregate([
    { $match: propertyQuery },
    { $unwind: '$tenant' },
    {
      $match: {
        'tenant.tenantId': { $in: tenantIdNoObj },
        'tenant.isActive': true,
      },
    },
    {
      $group: {
        _id: '$tenant.tenantId',
        tenant: { $first: '$tenant' },
      },
    },
    {
      $project: {
        _id: 0,
        tenantId: '$_id',
        tenant: 1,
      },
    },
  ]);

  // Extract the tenantIds from the aggregation result
  const tenantIdsArray = propertyTenants.map(tenant => tenant.tenantId);
  // Find users with matching tenant IDs
  const tenants = await UserModel.find({ _id: { $in: tenantIdsArray } });

  return tenants;

}

async function findTenantIds(searchTerm: string): Promise<string[]> {
  const users = await UserModel.find({
    accountTypes: { $in: [1] },
    $or: [
      { firstname: { $regex: searchTerm, $options: 'i' } },
      { lastname: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ],
  }).select('_id');

  return users.map(user => user._id);
}



