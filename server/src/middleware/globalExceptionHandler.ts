import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import { apiError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  switch (true) {
    case typeof err === 'string':
      const is404 = !!err.toLowerCase().endsWith('not found');
      const is409 = !!err.toLowerCase().endsWith('already exist');

      const statusCode = is404 ? StatusCodes.NOT_FOUND : is409 ? StatusCodes.CONFLICT : StatusCodes.BAD_REQUEST;
      logger.error(err);
      return apiError(res, err, statusCode);

    case err.name === 'ValidationError':
      logger.error(err);
      return apiError(res, err.message);

    case err.name === 'UnauthorizedError':
      logger.error(err);
      return apiError(res, err.message, StatusCodes.UNAUTHORIZED);

    case err.name === 'TokenExpiredError':
      logger.error(err);
      return apiError(res, err.message, StatusCodes.BAD_REQUEST);

    case err.name === 'JsonWebTokenError':
      logger.error(err);
      return apiError(res, err.message, StatusCodes.BAD_REQUEST);

    default:
      logger.error(err);
      return apiError(res, err.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export function NotFoundHandler(req: Request, res: Response, next: NextFunction) {
  return apiError(res, 'resource not found', 404);
}
