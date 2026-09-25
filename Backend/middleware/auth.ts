import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/tokens.js";
import { findUserById } from "../repositories/user.repo.js";

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        throw ApiError.unauthorized("Authentication required");
    }

    let decoded: any;
    try {
        decoded = verifyToken(token);
    } catch {
        throw ApiError.unauthorized("Invalid or expired token");
    }

    const user = await findUserById(decoded.id);
    if (!user) {
        throw ApiError.unauthorized("User no longer exists");
    }

    req.user = user;
    next();
});
