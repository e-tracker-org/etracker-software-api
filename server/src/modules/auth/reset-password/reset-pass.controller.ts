import argon2 from 'argon2';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {apiError, apiResponse} from '../../../utils/response';
import { deleteOTP, findOTP } from '../otp/otp.service';
import {findUserByEmail, updateUserByEmail} from '../register/register.service';

import { ResetPassBody } from './reset-pass.schema';
import {comparePasswords} from "../../../helpers/comparePassword";

export async function resetPassHandler(req: Request<{}, {}, ResetPassBody>, res: Response, next: NextFunction) {
  try {
    const { email, otp, password } = req.body;

    // Check if OTP exists and not expired
    const otpData = await findOTP(otp, email);
    const user = await findUserByEmail(email);



    if (!otpData || +new Date(otpData.expiresAt) < +Date.now()) throw 'Invalid or expired OTP';

    // Verify old password and new password is not the same
    if(await comparePasswords(user.password, password))
    return apiError(res, 'Please enter a new password');

    // Verify OTP
    const secret = otpData.secret;
    const otpHash = crypto.createHmac('sha256', otp).digest('hex');

    if (otpHash !== secret) throw 'Invalid OTP';

    // If OTP is valid, delete the OTP data from database
    await deleteOTP(otp);

    // Update password in database
    await updateUserByEmail(email, await argon2.hash(password));

    return apiResponse(res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
}
