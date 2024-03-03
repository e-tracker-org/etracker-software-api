import { type Request, type Response, type NextFunction } from 'express';
import { signJwt, verifyJwt } from '../../../modules/auth/login/login.utils';
import { apiResponse } from '../../../utils/response';
import { findUserByEmail, updateUserIsVerifiedByEmail } from '../register/register.service';
import { RegisterUserBody } from '../register/register.schema';
import { TokenBody } from './token.schema';
import { attachCookie } from '../../../helpers/attachCookie';
import { StatusCodes } from 'http-status-codes';
import { sendEmaiLink } from '../register/register.controller';

export async function verifyToken(req: Request<{}, {}, TokenBody>, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;

    const decoded = verifyJwt(token);

    if (!decoded) {
      await handleReverifyToken(token);
      throw 'Invalid token or token expired, token has been resent via mail to confirm account';
    }

    const { sub: email } = decoded;
    if (!email) throw 'Email field in token is not found';

    if (typeof email === 'string') {
      const user = await findUserByEmail(email);

      if (!user) throw 'User not found';
      if (user.isEmailVerified) return apiResponse(res, 'Token is already verified');

      await updateUserIsVerifiedByEmail(user.email);

      return apiResponse(res, 'Token is verified successfully');
    }
  } catch (error) {
    next(error);
  }
}

async function handleReverifyToken(token: string) {
  const payload = JSON.parse(atob(token.split('.')[1]));

  const user = await findUserByEmail(payload.sub);
  if (!user) throw 'User with email in token is not found';

  await sendEmaiLink(user);
}

export default verifyToken;
