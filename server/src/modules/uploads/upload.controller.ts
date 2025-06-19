import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/response';
import { FileItem } from './upload.model';
import {
  createDocs,
  createOrUpdateDocs,
  deleteFileById,
  getAllFiles,
  getFilesByUserId,
  getFilesByUserIdAndDocTypeId,
  purgeDocs
} from './upload.services';
import {findUserByEmail} from "../auth/register/register.service";
import {findFilesByCategoryAndType, getAllFileTypes} from "./file-types/file-types.service";

async function uploadToDB(req: Request, res: Response, next: NextFunction) {
  try {
    const documentGroups: FileItem[] = [];
    const uploadObj = res.locals.uploadedFiles;
    const { email } = res.locals.user;

    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if(!user) throw 'User not found';



    // assemble all fileItems array
    Object.keys(req.body)
      .filter((item) => item.endsWith('_docTypeID'))
      .forEach((key) => {
        const prefix = key.split('_')[0];
        const fileItem: FileItem = {
          docTypeID: req.body[`${prefix}_docTypeID`],
          docNo: req.body[`${prefix}_docNo`],
          description: req.body[`${prefix}_description`],
          files: uploadObj.names[`${prefix}_files`],
          urls: uploadObj.urls[`${prefix}_files`],
          userId: user.id
        };
        documentGroups.push(fileItem);
      });
    let result = null;
    const includesTypeId6 = documentGroups.some((file) => file.docTypeID === '7' || file.docTypeID === '6');
    if(includesTypeId6) {
       result = await createDocs(documentGroups);
    } else {
       result = await createOrUpdateDocs(documentGroups);
    }
    if (result) {
      // to be accessed by other mw. res.locals.uploadedFiles.fileItems
      uploadObj.fileItems = result;
    }
    next();
  } catch (error) {
    next(error);
  }
}

async function getAllFilesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllFiles();
    return apiResponse(res, 'Successful', result);
  } catch (error) {
    next(error);
  }
}


export async function getFilesUsingUserId(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const result = await getFilesByUserId(userId);
    return apiResponse(res, 'Successful', result);
  } catch (error) {
    next(error);
  }
}

export async function getUserFilesByCategoryAndType(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, category } = req.params;
    const { email } = res.locals.user;

    // Confirm logged-in user exists
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';

    if (!type) throw 'Document type is required';
    if (!category) throw 'Document category is required';

    const fileTypes = await findFilesByCategoryAndType(type, category, null);
    const docList = [];

    for (const fileType: FileItem of fileTypes) {
      const result = await getFilesByUserIdAndDocTypeId(user.id, Number(fileType?.typeID));
      if (result) {
        docList.push(result);
      }
    }

    return apiResponse(res, 'Successful', docList);
  } catch (error) {
    next(error);
  }
}


async function docsPurgeHandler(req: Request, res: Response) {
  const result = await purgeDocs();
  apiResponse(res, 'Successful', result);
}

export async function deleteFileHandler(req: Request, res: Response) {
  const { id } = req.params;
  if(!id) throw 'File id is to be deleted is required';
  const result = await deleteFileById(id);

  apiResponse(res, 'File deleted Successfully', result);
}

async function finishUploadHandler(req: Request, res: Response, next: NextFunction) {
  apiResponse(res, 'Files uploaded successfully!', res.locals.uploadedFiles.fileItems);
}


export { uploadToDB, getAllFilesHandler, docsPurgeHandler, finishUploadHandler };
