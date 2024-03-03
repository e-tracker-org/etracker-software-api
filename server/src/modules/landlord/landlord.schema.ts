import { array, boolean, number, object, string, TypeOf } from 'zod';

export const updateProfileSchema = {
  body: object({
    tenantEmail: string({
      required_error: 'email is required',
    }).email('must be a valid email'),
    landlordEmail: string({
      required_error: 'email is required',
    }).email('must be a valid email'),
    propertyId: string({
      required_error: 'Property id is required',
    }),
    confirmStatus: string({
      required_error: 'Gender is required',
    }),
  }),

};

export type UpdateProfileBody = TypeOf<typeof updateProfileSchema.body>;
export type UpdateProfileParams = TypeOf<typeof updateProfileSchema.params>;
