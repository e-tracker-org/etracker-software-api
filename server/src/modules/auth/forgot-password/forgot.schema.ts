import { object, string, TypeOf } from 'zod';

export const forgotPassSchema = {
  body: object({
    email: string({
      required_error: 'email is required',
    }).email('must be a valid email'),
  }),
};

export type ForgotPassEmailBody = TypeOf<typeof forgotPassSchema.body>;
