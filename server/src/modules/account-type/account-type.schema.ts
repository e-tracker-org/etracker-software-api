import { object, string, TypeOf, number } from 'zod';

export const accountTypeSchema = {
  body: object({
    accountType: string({
      required_error: 'Account type name is required',
    }),
    description: string({
      required_error: 'Account type description is required',
    }),
    typeID: number().optional(),
  }),
};

export type AccountTypeSchema = TypeOf<typeof accountTypeSchema.body>;
