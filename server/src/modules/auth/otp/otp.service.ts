import { OTP, OTPModel } from './otp.model';
import { User } from '../register/register.model';

export async function createOTP(otp: OTP) {
  return OTPModel.create(otp);
}

export async function findOTP(otp: OTP['otpCode'], email: User['email']) {
  return OTPModel.findOne({ otpCode: otp, userEmail: email });
}

export async function deleteOTP(otp: OTP['otpCode']) {
  return OTPModel.deleteOne({ otpCode: otp });
}

export async function deleteOTPByEmail(userEmail: OTP['userEmail']) {
  return OTPModel.deleteOne({ userEmail: userEmail });
}
