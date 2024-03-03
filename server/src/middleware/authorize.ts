import { type Response, type NextFunction } from 'express';
import { expressjwt as jwt, Request as JWTRequest } from 'express-jwt';
import { JWT_SECRET } from '../../src/constants';
import { apiError } from '../../src/utils/response';
import { findById } from '../../src/modules/profile/profile.service';

export function authorize(roles: string | string[] | null = null) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    jwt({ secret: JWT_SECRET, algorithms: ['HS256'] }),

    async (req: JWTRequest, res: Response, next: NextFunction) => {
      const user = await findById(req.auth?.id);

      if (!user) {
        return apiError(res, 'Unauthorized', 401);
      }

      next();
    },
  ];
}
