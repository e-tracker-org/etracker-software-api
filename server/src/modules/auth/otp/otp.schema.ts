import { object, string, TypeOf } from 'zod';

export const otpSchema = {
  body: object({
    email: string({
      required_error: 'email is required',
    }).email('must be a valid email'),
    otp: string({
      required_error: 'OTP is required',
    }),
  }),
};

export type OtpBody = TypeOf<typeof otpSchema.body>;
