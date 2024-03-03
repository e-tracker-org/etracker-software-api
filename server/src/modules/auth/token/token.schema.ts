import { object, string, TypeOf } from "zod";

export const tokenSchema = {
    body: object({
        token: string({
            required_error: "token is required",
        }),
    })
};

export type TokenBody = TypeOf<typeof tokenSchema.body>;

