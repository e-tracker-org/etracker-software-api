import { Request, Response, NextFunction } from 'express';
import uploadHelper from '../../../modules/uploads/upload-mw';
import { updateUserKycHandler } from '../../profile/profile.controller';

export default async function updateProfileStage(req: Request, res: Response, next: NextFunction) {
  uploadHelper(req, res, (err: any) => {
    if (err) next(err);
    updateUserKycHandler(req, res, next);
  });
}
