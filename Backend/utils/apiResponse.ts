import { Response } from "express";

interface SuccessPayload {
    statusCode?: number;
    message?: string;
    data?: any;
    meta?: Record<string, any>;
}

export function sendSuccess(
    res: Response,
    { statusCode = 200, message = "OK", data = null, meta = {} }: SuccessPayload
) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    });
}
