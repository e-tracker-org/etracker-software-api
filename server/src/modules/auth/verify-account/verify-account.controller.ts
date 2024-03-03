import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../../utils/response';
import { verifyJwt } from '../login/login.utils';
import { findUserByEmail, updateUserIsVerifiedByEmail } from '../register/register.service';

export async function verifyAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const payload = verifyJwt(token);

    if (payload !== null) {
      const { sub: email } = payload;

      if (email && typeof email === 'string') {
        const user = await findUserByEmail(email);
        if (!user) throw 'User does not exist';

        await updateUserIsVerifiedByEmail(user.email);
      }

      return apiResponse(res, 'Account verified successfully');
    }
  } catch (err: any) {
    next(err);
  }
}
