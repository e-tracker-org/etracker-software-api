import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import uploadDir from './upload-dir';

function getUploadFileName(req: Request, file: Express.Multer.File) {
  const fieldName = file.fieldname;
  const files = req.files;
  const uploadObj = req.res?.locals.uploadedFiles;

  let docCount = 0;
  if (Array.isArray(files)) {
    docCount = files.filter((file) => file.fieldname === fieldName).length;
  }
  const countPart = docCount > 1 ? `_${docCount - 1}` : '';

  if (!uploadObj.names[fieldName]) {
    uploadObj.names[fieldName] = [];
  }

  const reqField = uploadObj.names[fieldName];

  const userId = req.body.userId ?? 'userid';

  const fName = file.originalname;
  const extension = fName.substring(fName.lastIndexOf('.') + 1); // file extension

  const docPrefix = file.fieldname.split('_')[0];
  const docType = `${docPrefix}_docTypeID`;

  const docNo = req.body[`${docPrefix}_docNo`];
  const docTypeId = req.body[`${docPrefix}_docTypeID`];

  const fileName = `${userId}_${docTypeId}_${docNo}${countPart}.${extension}`;

  reqField.push(fileName);

  return fileName;
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => cb(null, uploadDir),
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const fileName = `${getUploadFileName(req, file)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage }).any();

async function uploadFilesToLocal(req: Request, res: Response, next: NextFunction): Promise<void> {
  req.res = res;
  req.res.locals.uploadedFiles = { names: {}, urls: {}, fileItems: [], ids: {} };
  upload(req, res, next);
}

export { uploadFilesToLocal };
