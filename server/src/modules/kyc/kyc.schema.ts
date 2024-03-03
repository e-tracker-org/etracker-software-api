import { object, string, TypeOf, number } from 'zod';

export const accountTypeSchema = {
  body: object({
    accountType: string({ required_error: 'No Accoun-type selected' }),
    stage: string({ required_error: 'No stage specified' }),
  }),
};

export type AccountTypeSchema = TypeOf<typeof accountTypeSchema.body>;
