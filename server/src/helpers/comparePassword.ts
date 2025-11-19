import argon2 from "argon2";

export const comparePasswords = (hashedPassword: string, plainPassword: string): Promise<boolean> => {
    // Check if the hashed password is in the correct format (starts with $)
    if (!hashedPassword || !hashedPassword.startsWith('$')) {
        // Password in DB is not hashed (legacy). Compare directly.
        // Return a resolved promise to keep the API consistent.
        return Promise.resolve(hashedPassword === plainPassword);
    }

    return argon2.verify(hashedPassword, plainPassword);
}
