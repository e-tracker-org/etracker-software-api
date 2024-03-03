import { type NextFunction, type Request, type Response } from 'express';

import { apiResponse } from '../../../utils/response';
import generateOtp from '../../../helpers/generate-otp';
import { OTP } from '../otp/otp.model';
import { findUserByEmail } from '../register/register.service';

import { type ForgotPassEmailBody } from './forgot.schema';
import { createOTP, deleteOTPByEmail } from '../otp/otp.service';
import {signJwt} from "../login/login.utils";
import {EMAIL_VERIFICATION_EXPIRES_IN} from "../../../constants";
import {sendEmail} from "../../email-service";
import {emailFormat} from "../register/register.email";
import {emailConfirmationLinkTemplate, emailTokenTemplate} from "../../../utils/email-templates";
import { User } from '../register/register.model';

export async function forgotPassHandler(
  req: Request<Record<string, unknown>, Record<string, unknown>, ForgotPassEmailBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    //verify email exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User with email not found';

    //generate new otp for the user
    const { otp, secret, expires } = generateOtp();

    //Delete user otp if exist by email first before saving otp
    await deleteOTPByEmail(user.email);
    await storeOtp(user.email, otp, secret, expires);
    await sendOTP(user, otp);

    return apiResponse(res, 'OTP generated and sent to email successfully');
  } catch (err) {
    next(err);
  }
}

async function storeOtp(email: string, otpCode: string, secret: string, expires: Date) {
  const otp: OTP = new OTP();
  otp.userEmail = email;
  otp.otpType = 'forgot-password-otp';
  otp.otpCode = otpCode;
  otp.secret = secret;
  otp.expiresAt = expires;

  return createOTP(otp);
}

const sendOTP = async (user: User, otp: string) => {
  return await sendEmail(user.email, 'Reset your password on E-tracka', emailTokenTemplate(user, otp));
};
