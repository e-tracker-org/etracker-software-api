import { NextFunction, Request, Response } from 'express';
import { isValid } from '../../utils/database';
import { apiResponse } from '../../utils/response';
import {
  create,
  createOrUpdateProperty,
  deleteById,
  findAll,
  findById,
  findByStatus,
  findByUserId
} from './property.service';
import { Property, PropertyModel } from './property.model';
import { findByEmail } from '../profile/profile.service';
import { findUserByEmail } from '../auth/register/register.service';
import {getFileById} from "../uploads/upload.services";
import {prop} from "@typegoose/typegoose";
import {FileItem} from "../uploads/upload.model";

export default {
  createProperty,
  findAllProperties,
  findPropertiesById,
  findPropertyByStatus,
  findPropertyByUserId,
  updatePropertyById,
  deletePropertyById,
};

async function createProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findUserByEmail(res.locals.user.email);
    if (!user) next('User not found');

    req.body.current_owner = user;
    req.body.created_by = user;
    req.body.userId = user.id;
    req.body.image_list = res.locals.uploadedFiles?.fileItems;
    // const property = await create(req.body);

    const property = await createOrUpdateProperty(req.body.id, req.body);

    if (res.locals.kyc?.isKyc) {
      res.locals.kyc.property = { ...property };
      return next();
    }

    return apiResponse(res, 'Property created successfully', property, 201);
  } catch (err) {
    next(err);
  }
}

async function findAllProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const propertyList= await findAll();
    // if (!propertyList.length) throw `No properties found`;
    const updatedPropertyList = [];

    for (const property:Property of propertyList) {
      const imagePromises = property.image_list.map(fileId => getFileById(fileId.toString()));
      const images = await Promise.all(imagePromises);
      property._doc.image_list = images; // Retain the original image_list property

      updatedPropertyList.push(property);
    }
    return apiResponse(res, 'Property list fetched successfully', updatedPropertyList);
  } catch (err) {
    next(err);
  }
}

async function findPropertiesById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const property = await getProperty(id);
    if (!property) throw `No property found`;
    const imagePromises = property.image_list.map(fileId => getFileById(fileId.toString()));
    const images = await Promise.all(imagePromises);
    property._doc.image_list = images; // Retain the original image_list property

    return apiResponse(res, 'Property fetched successfully', property);
  } catch (err) {
    next(err);
  }
}

async function findPropertyByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;

    const property: Array<Property> = await findByStatus(status);
    if (!property.length) throw `Property with status ${status} is not found`;

    return apiResponse(res, `Property fetched by status ${status} fetched successfully`, property);
  } catch (err) {
    next(err);
  }
}

async function findPropertyByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = res.locals.user;
    const { category } = req.body;
    const user = await findByEmail(email);
    if (!user) throw 'User not found';

    const properties: Array<Property> = await findByUserId(user.id, category);
    // if (!properties.length) throw `You have no properties, as property is not found`;
    console.log('user>>>>', user.id)
    const updatedPropertyList = [];
    for (const property:Property of properties) {
      const imagePromises = property.image_list.map(fileId => getFileById(fileId.toString()));
      const images = await Promise.all(imagePromises);
      property._doc.image_list = images; // Retain the original image_list property

      updatedPropertyList.push(property);
    }
    return apiResponse(res, 'Property list fetched successfully', updatedPropertyList);
  } catch (err) {
    next(err);
  }
}

async function updatePropertyById(req: Request, res: Response, next: NextFunction) {
  try {
    const property = await getProperty(req.params.id);
    Object.assign(property, req.body);
    const data = await property.save();

    return apiResponse(res, 'Property updated successfully', data);
  } catch (err) {
    next(err);
  }
}

async function deletePropertyById(req: Request, res: Response, next: NextFunction) {
  try {
    const property = await getProperty(req.params.id);
    await deleteById(property.id);

    return apiResponse(res, 'Property deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function getProperty(id: string) {
  if (!isValid(id)) throw 'Invalid Property ID';
  const property = await findById(id);
  if (!property) throw 'Property not found';
  return property;
}
