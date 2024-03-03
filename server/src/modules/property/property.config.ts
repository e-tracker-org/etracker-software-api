import { NextFunction, Request, Response } from 'express';

export default async function propertyConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  req.body.price = Number(req.body.price);
  req.body.year_built = Number(req.body.year_built);
  req.body.number_of_bedrooms = Number(req.body.number_of_bedrooms);

  req.body.number_of_bath = Number(req.body.number_of_bath);

  req.body.location = {
    city: req.body['city'],
    state: req.body['state'],
  };

  next();
}
