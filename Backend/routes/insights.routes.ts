import { Router } from "express";
import { getInsights, getInbox } from "../controllers/insights.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/insights", protect, getInsights);
router.get("/inbox", protect, getInbox);

export default router;
