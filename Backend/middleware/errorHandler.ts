import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    let error = err;

    if (error.name === "ValidationError") {
        const details = Object.values(error.errors || {}).map((e: any) => e.message);
        error = ApiError.badRequest("Validation failed", details);
    } else if (error.name === "CastError") {
        error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error.code === "23505") {
        const field = Object.keys(error.keyValue || {})[0] || "field";
        error = ApiError.conflict(`${field} already exists`);
    } else if (!(error instanceof ApiError)) {
        error = ApiError.internal(error.message || "An unexpected error occurred");
    }

    if (!isProd && error.statusCode >= 500) {
        console.error(err);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
    });
}
