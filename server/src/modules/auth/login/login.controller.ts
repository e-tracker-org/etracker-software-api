import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { apiError, apiResponse } from '../../../utils/response';
import { findUserByEmail } from '../register/register.service';
import { LoginBody } from './login.schema';
import { signJwt } from './login.utils';
import { attachCookie } from '../../../helpers/attachCookie';
import { comparePasswords } from '../../../helpers/comparePassword';
import { CORS_ORIGIN, EMAIL_VERIFICATION_EXPIRES_IN } from '../../../constants';
import { sendEmail } from '../../email-service';
import { emailFormat } from '../register/register.email';
import { emailConfirmationLinkTemplate } from '../../../utils/email-templates';
import { User } from '../register/register.model';

export async function loginHandler(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user || !(await comparePasswords(user.password, password))) {
      return apiError(res, 'Invalid email or password', 401);
    }
    // Send email verification link if isEmailVerified is false
    if (!user.isEmailVerified) {
      await sendemail(user);
      return apiResponse(res, 'Email verification mail is sent successfully', {}, 201);
    }

    const jwt = signJwt({ id: user.id, email: user.email });
    attachCookie(res, jwt);

    return apiResponse(res, 'Login successful', { tokens: jwt, user });
  } catch (err) {
    next(err);
  }
}

export async function loginFailureHandler(req: Request<{}, {}, {}>, res: Response) {
  return apiError(res, 'Login failure', 401);
}

export async function logoutHandler(req: Request<{}, {}, {}>, res: Response) {
  req.session.destroy(() => {})
  // Or clear the user token stored in cookies
  res.clearCookie('userLogin');

  return apiResponse(res, 'Logout successful', null);
}

const sendemail = async (user: User) => {
  const token = signJwt({ sub: user.email }, EMAIL_VERIFICATION_EXPIRES_IN);
  return sendEmail(user.email, emailFormat.subject, emailConfirmationLinkTemplate(user, token));
};
