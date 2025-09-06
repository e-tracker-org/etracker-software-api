import argon2 from "argon2";

export const comparePasswords = (hashedPassword: string, plainPassword: string): Promise<boolean> => {
    // Check if the hashed password is in the correct format (starts with $)
    if (!hashedPassword.startsWith('$')) {
        return Promise.resolve(false);
    }
    return argon2.verify(hashedPassword, plainPassword);
}
