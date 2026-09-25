import { Router } from "express";
import { getInsights, getInbox } from "../controllers/insights.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/insights", getInsights);
router.get("/inbox", getInbox);

export default router;