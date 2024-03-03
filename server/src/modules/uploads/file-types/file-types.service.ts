import { FileType, FileTypeModel } from './file-types.model';

async function create(fileTypes: Omit<FileType, any>) {
  return await FileTypeModel.create(fileTypes);
}

async function getAllFileTypes() {
  return await FileTypeModel.find();
}

async function findById(id: string) {
  return await FileTypeModel.findById(id);
}

async function findByTypeId(typeId: number) {
  return await FileTypeModel.findOne({ typeID: typeId });
}

// Type of file example property, profile, documents etc
export async function findFilesByType(type: string, requiredFor) {
  const query = createQuery (type, null, requiredFor);
  return await FileTypeModel.find(query);
}
//Type of file category example kyc, property, profile etc
export async function findFilesByCategory(category: string, requiredFor) {
  const query = createQuery (null, category, requiredFor);
  return await FileTypeModel.findOne(query);
}

export async function findFilesByCategoryAndType(type: string, category: string, requiredFor) {
  const query = createQuery (type, category, requiredFor);
  return await FileTypeModel.find(query);
}

async function deleteById(id: string) {
  return await FileTypeModel.findByIdAndDelete(id);
}

async function purgeFileTypes() {
  return await FileTypeModel.remove();
}

const createQuery = (type, category, requiredFor) => {
  let query: any = {};

  if(category) {
    query.category = category
  }

  if(type) {
      query.type = type
  }

  if (requiredFor) {
    query.requiredFor = { $in: requiredFor };
  }
  // else {
  //   query.$or = [{ requiredFor: { $exists: false } }, { requiredFor: { $size: 0 } }];
  // }

  return query;
}

export { create, getAllFileTypes, findById, deleteById, purgeFileTypes, findByTypeId};
