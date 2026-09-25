import { User } from "../types/index.js";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export {};
