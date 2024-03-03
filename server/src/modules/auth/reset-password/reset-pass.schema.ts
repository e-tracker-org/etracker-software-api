import { object, string, TypeOf } from 'zod';

export const resetPassBody = {
  body: object({
    email: string({
      required_error: 'email is required',
    }).email('email must be a valid'),
    otp: string({
      required_error: 'otp is required',
    }),
    password: string({
      required_error: 'password is required',
    })
      .min(6, 'password must be at least 6 characters long')
      .max(64, 'password must be at most 64 characters long'),
    confirmPassword: string({
      required_error: 'confirmPassword is required',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  }),
};

export type ResetPassBody = TypeOf<typeof resetPassBody.body>;
