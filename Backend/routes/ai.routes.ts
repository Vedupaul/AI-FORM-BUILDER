import { Router } from "express";
import {
    generateForm,
    generateValidation,
    improveQuestion,
    formSummary,
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.js";
import { aiDailyLimit } from "../middleware/rateLimiter.js";

const router = Router();
router.use(protect);

// Apply daily 5-generation rate limit to full form creation
router.post("/generate-form", aiDailyLimit, generateForm);
router.post("/generate-validation", generateValidation);
router.post("/improve-question", improveQuestion);
router.post("/form-summary", formSummary);

export default router;
