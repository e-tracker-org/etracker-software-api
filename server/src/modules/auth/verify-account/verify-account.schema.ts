import { object, string } from 'zod';

export const verifyAccountSchema = {
  body: object({
    token: string({
      required_error: 'token is required',
    }),
  }),
};
