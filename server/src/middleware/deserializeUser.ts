import { type Request, type Response, type NextFunction } from 'express';
import { verifyJwt } from '../modules/auth/login/login.utils';
import { findById } from '../modules/profile/profile.service';

async function deserializeUser(req: Request, res: Response, next: NextFunction) {
  const accessToken = (req.headers.authorization || req.cookies.accessToken || '').replace(/^Bearer\s/, '');

  if (!accessToken) {
    return next();
  }

  const decoded = verifyJwt(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    const user = await findById(res.locals.user.id);

    if (user) {
      res.locals.user = user;
    }
  }

  return next();
}

export default deserializeUser;
