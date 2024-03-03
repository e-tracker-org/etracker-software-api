import { Property, PropertyModel } from './property.model';
import {Types} from "mongoose";
const { ObjectID } = require('mongodb');

export async function create(property: Property) {
  return await PropertyModel.create(property);
}

export async function findAll() {
  return PropertyModel.find();
}

export async function findById(id: string) {
  return PropertyModel.findById(id);
}

export async function findByUserId(userId: any, category?: string) {
  if(category) {
    return PropertyModel.find({ current_owner: userId, category });
  } else {
    return PropertyModel.find({ current_owner: userId });
  }

}

export async function findByStatus(status: any) {
  return PropertyModel.find({ status });
}

export async function searchaByName(name: string) {
  if(name) {
    return PropertyModel.find({ name });
  }
  return PropertyModel.find();
}

export async function deleteById(id: string) {
  await PropertyModel.findByIdAndDelete(id);
}

export async function createOrUpdateProperty(id, data) {
  const filter = { _id: id };
  const update = { $set: data };

  if(!!id) {
    return await PropertyModel.updateOne(filter, update);
  }
 return  await PropertyModel.create(data);
}









