import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getInsights as fetchInsights, getInbox as fetchInbox } from "../services/insights.service.js";

export const getInsights = asyncHandler(async (req: Request, res: Response) => {
    const data = await fetchInsights(req.user!._id);
    sendSuccess(res, { data: { insights: data } });
});

export const getInbox = asyncHandler(async (req: Request, res: Response) => {
    const responses = await fetchInbox(req.user!._id, { search: (req.query.search as string) || "" });
    sendSuccess(res, { data: { responses, count: responses.length } });
});
