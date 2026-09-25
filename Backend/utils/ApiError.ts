export class ApiError extends Error {
    public statusCode: number;
    public details?: any;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string = "Bad request", details?: any): ApiError {
        return new ApiError(400, message, details);
    }

    static unauthorized(message: string = "Unauthorized"): ApiError {
        return new ApiError(401, message);
    }

    static forbidden(message: string = "Forbidden"): ApiError {
        return new ApiError(403, message);
    }

    static notFound(message: string = "Resource not found"): ApiError {
        return new ApiError(404, message);
    }

    static conflict(message: string = "Conflict"): ApiError {
        return new ApiError(409, message);
    }

    static internal(message: string = "Something went wrong"): ApiError {
        return new ApiError(500, message);
    }
}

export default ApiError;
