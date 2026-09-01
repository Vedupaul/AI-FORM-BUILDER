import dotenv from "dotenv";
dotenv.config();

export const isProd = process.env.NODE_ENV === "production";

export const env = {
    port: parseInt(process.env.PORT, 10) || 8000,
    nodeEnv: process.env.NODE_ENV || "development",
    isProd,
    clientUrls: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((url) => url.trim()),
    DATABASE_URL: process.env.DATABASE_URL?.trim() || "",
    databaseUrl: process.env.DATABASE_URL?.trim() || "",
    jwtSecret: process.env.JWT_SECRET || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
};

export default env;
