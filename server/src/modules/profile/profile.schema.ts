import { array, boolean, number, object, string, TypeOf } from 'zod';

export const updateProfileSchema = {
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
    state: string({
      required_error: 'State is required',
    }),
    phone: string({
      required_error: 'Phone is required',
    }),
    gender: string({
      required_error: 'Gender is required',
    }),
    dob: string({
      required_error: 'Date of birth is required',
    }),
    country: string({
      required_error: 'Country is required',
    }),
    area: string({
      required_error: 'Area is required',
    }),
    fullAddress: string({
      required_error: 'Full address is required',
    }),
    accountType: string({
      required_error: 'Account type is required',
    }).optional(),
    isKyc: boolean().optional(),
    currentKyc: object({
      kycId: string().optional(),
      accountType: number().optional(),
      kycStage: number().optional(),
    }).optional(),
    profileImage: string().url().optional(),
  }),
  params: object({
    profileId: string(),
  }),
};

export type UpdateProfileBody = TypeOf<typeof updateProfileSchema.body>;
export type UpdateProfileParams = TypeOf<typeof updateProfileSchema.params>;
