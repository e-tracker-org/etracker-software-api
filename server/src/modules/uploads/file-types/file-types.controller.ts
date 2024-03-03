import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../../utils/response';
import {
  create,
  findFilesByCategory,
  findFilesByCategoryAndType,
  findFilesByType,
  getAllFileTypes
} from './file-types.service';
import { CreateFileTypeBody } from './file-types.schema';

async function createFileType(req: Request<{}, {}, CreateFileTypeBody>, res: Response, next: NextFunction) {
  try {
    await create(req.body);
    return apiResponse(res, 'File-types created successfully');
  } catch (error) {
    next(error);
  }
}

async function getFileTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllFileTypes();
    return apiResponse(res, 'List of all file types', result);
  } catch (error) {
    next(error);
  }
}

export async function getFilesByType(req: Request, res: Response, next: NextFunction) {
  try {
    //type examples(document files, profile files, property files)
    //accountType example(1:tenant,2:landlord,3:admin1 etc...)
    const { type, accountType } = req.params;

    if(!type) throw 'Type field is required';
    if(!accountType) throw 'Account type field is required';
    const fileTypes = await findFilesByType(type, accountType);

    return apiResponse(res, 'List of  file types by type', fileTypes);
  } catch (error) {
    next(error);
  }
}

export async function getFilesByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    //type examples(document files, profile files, property files)
    //accountType example(1:tenant,2:landlord,3:admin1 etc...)
    const { category, accountType } = req.params;
    if(!category) throw 'Category field is required';
    if(!accountType) throw 'Account type field is required';

    const result = await findFilesByCategory(category, accountType);
    return apiResponse(res, 'List of  file types by categories', result);
  } catch (error) {
    next(error);
  }
}

export async function getFilesByTypeAndCategory(req: Request, res: Response, next: NextFunction) {
  try {
    //type examples(document files, profile files, property files)
    //accountType example(1:tenant,2:landlord,3:admin1 etc...)
    const { type, category, accountType } = req.params;
    if(!type) throw 'Type field is required';
    if(!category) throw 'Category field is required';
    if(!accountType) throw 'Account type field is required';


    const result = await findFilesByCategoryAndType(type, category, accountType);
    return apiResponse(res, 'List of  file types by type and category', result);
  } catch (error) {
    next(error);
  }
}

export { createFileType, getFileTypes };
