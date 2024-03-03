import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../../utils/response';
import { findUserByEmail } from '../register/register.service';
import { OtpBody } from './otp.schema';
import { deleteOTP, findOTP } from './otp.service';

const crypto = require('crypto');

export async function verifyOtpHandler(req: Request<{}, {}, OtpBody>, res: Response, next: NextFunction) {
  const { email, otp } = req.body;
  try {
    // check if user exists
    const user = await findUserByEmail(email);
    if (!user) throw 'Incorrect email';

    // Check if OTP exists and not expired
    const otpData = await findOTP(otp, email);

    // Check if expired
    // @ts-ignore
    if (!otpData || (+new Date(otpData.expiresAt) < +new Date())) throw 'Invalid or expired OTP';

    // Verify OTP
    const otpHash = crypto.createHmac('sha256', otp).digest('hex');
    if (otpHash !== otpData.secret) throw 'Invalid OTP';

    // If OTP is valid, delete the OTP from database
    await deleteOTP(otp);

    // Update password in database
    // await updateUserByEmail(email, password)
    return apiResponse(res, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
}
