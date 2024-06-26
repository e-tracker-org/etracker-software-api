import { array, number, object, string, TypeOf } from 'zod';

export const registerUserSchema = {
  body: object({
    firstname: string({
      required_error: 'Firstname is required',
    }),
    lastname: string({
      required_error: 'Lastname is required',
    }),
    email: string({
      required_error: 'email is required',
    }).email('must be a valid email'),
    phone: string({
      required_error: 'phone number is required',
    }),
    propertyId: string().optional(),
    landmark: string().optional(),
    password: string({
      required_error: 'password is required',
    })
      .min(6, 'Password must be at least 6 characters long')
      .max(64, 'Password should not be longer than 64 characters'),
    confirmPassword: string({
      required_error: 'username is required',
    }),
    accountTypes: array(number()).default([]),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
};

export type RegisterUserBody = TypeOf<typeof registerUserSchema.body>;
