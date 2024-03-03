import {array, boolean, date, number, object, string, TypeOf} from 'zod';

export const transactionSchema = {
  body: object({
    category: string({
      required_error: 'Category is required',
    }),
    amount: string({
      required_error: 'Transaction amount is required',
    }),
    dueDate: date({
      required_error: 'Transaction due date is required',
    }),
    tenants: array(
        string().trim().required('Tenant is required').min(1, 'At least one tenant is required')
    ),
  })
};

export type transactionBody = TypeOf<typeof transactionSchema.body>;




