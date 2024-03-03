import { array, boolean, number, object, string, TypeOf } from 'zod';

export const receiptSchema = {
    body: object({
        name: string({
            required_error: 'Receipt name or category is required',
        }),
        description: string({
            required_error: 'Description is required',
        }),
    })
};


export type ReceiptBody = TypeOf<typeof receiptSchema.body>;




