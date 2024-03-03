import { NextFunction, Request, Response } from 'express';
import { LoginBody } from '../login/login.schema';
import { apiResponse } from '../../../utils/response';
import { signJwt } from '../login/login.utils';
import { attachCookie } from '../../../helpers/attachCookie';
import { CORS_ORIGIN } from '../../../constants';

export function googleLoginHandler(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
  const jwt = signJwt({ user: req.user });
  attachCookie(res, jwt);
  const redirectUrlWithToken = `${CORS_ORIGIN}/onboarding?token=${jwt}`;
  res.redirect(redirectUrlWithToken);
  // return apiResponse(res, 'Login successful', { tokens: jwt });
}
