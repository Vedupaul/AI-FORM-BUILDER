import crypto from "crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function nanoid(size: number = 12): string {
    const bytes = crypto.randomBytes(size);
    let id = "";
    for (let i = 0; i < size; i++) {
        id += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return id;
}
