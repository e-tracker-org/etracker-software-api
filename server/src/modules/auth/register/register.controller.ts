import { NextFunction, Request, Response } from 'express';
import { CORS_ORIGIN, EMAIL_VERIFICATION_EXPIRES_IN } from '../../../constants';
import { sendEmail } from '../../email-service';
import { apiResponse } from '../../../utils/response';
import { signJwt } from '../login/login.utils';
import { emailFormat } from './register.email';
import { RegisterUserBody } from './register.schema';
import { createUser, findUserByEmail } from './register.service';
import { emailConfirmationLinkTemplate } from '../../../utils/email-templates';
import { User } from './register.model';

export async function registerUserHandler(req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) {
  const {email} = req.body
  try {
    const isUser = await findUserByEmail(email);
    if (!!isUser) {
      const {isEmailVerified} = isUser
      if (!!isEmailVerified) throw 'User already exist';
      await sendEmaiLink(isUser);
      return apiResponse(res, 'Click on the verification link sent to your email to complete your account creation', {}, 201);
    }

    const user = await createUser(req.body);
    await sendEmaiLink(user);
    return apiResponse(res, 'User created and verification mail is sent successfully', user, 201);
  } catch (err) {
    next(err);
  }
}

export const sendEmaiLink = async (user: any) => {
  const token = signJwt({ sub: user.email }, EMAIL_VERIFICATION_EXPIRES_IN);
  return await sendEmail(user.email, emailFormat.subject, emailConfirmationLinkTemplate(user, token));
};
