import { object, string, array, number, TypeOf } from 'zod';

export const createFileTypeSchema = {
  body: object({
    typeID: number().optional(),
    category: string().optional(),
    type: string().optional(),
    name: string({
      required_error: 'name is required for the file-type',
    }),
    description: string().optional(),
    expectedMimes: array(string()).optional(),
    askForDocID: number().optional(),
    requiredFor: array(number()).optional(),
    optionalFor: array(number()).optional(),
  }),
};

export const updateFileTypeSchema = {
  body: object({
    typeID: number().optional(),
    type: string().optional(),
    name: string().optional(),
    description: string().optional(),
    expectedMimes: array(string()).optional(),
    askForDocID: number().optional(),
    requiredFor: array(number()).optional(),
    optionalFor: array(number()).optional(),
  }),
};

export type CreateFileTypeBody = TypeOf<typeof createFileTypeSchema.body>;
