import { NextFunction, Request, Response } from 'express';
import { uploadFilesToLocal } from './upload.local';
import { uploadToCloud } from './upload.cloud';
import { uploadToDB } from './upload.controller';

/*
    uploaded files will be stored in req.locals.uploadedFiles.fileItems
*/
async function uploadHelper(req: Request, res: Response, next: NextFunction) {
  uploadFilesToLocal(req, res, (err?: any) => {
    if (err) return next(err);
    uploadToCloud(req, res, (err?: any) => {
      console.log('uploadToCloud>>>', uploadToCloud)
      if (err) return next(err);
      uploadToDB(req, res, next);
    });
  });
}

export default uploadHelper;
