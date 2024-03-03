import argon2 from "argon2";

export const  comparePasswords = (password1: string, password2: string): Promise<boolean>  => {
    return argon2.verify(password1, password2);
}

