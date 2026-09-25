import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JWTPayload } from "../types/index.js";

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
}
