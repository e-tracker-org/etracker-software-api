import { Request, Response, NextFunction } from 'express';
import uploadHelper from '../../uploads/upload-mw';
import propertySchema from '../../property/property.schema';
import propertyConfig from '../../property/property.config';
import propertyController from '../../property/property.controller';

export default async function addPropertyStage(req: Request, res: Response, next: NextFunction) {
  uploadHelper(req, res, (err: any) => {
    if (err) next(err);
    propertyConfig(req, res, (err: any) => {
      if (err) next(err);
      propertySchema.create()(req, res, (err: any) => {
        if (err) next(err);
        propertyController.createProperty(req, res, next);
      });
    });
  });
}
