import { Request, Response, NextFunction } from 'express';
import uploadHelper from '../../uploads/upload-mw';

export default async function identityDocumentStage(req: Request, res: Response, next: NextFunction) {
  await uploadHelper(req, res, next);
}
