import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as responseService from "../services/response.service.js";
import { getFormAnalytics } from "../services/analytics.service.js";
import { responsesToCsv } from "../utils/csv.js";

export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const { answers, completionTime } = req.body;
    const meta = {
        userAgent: req.headers["user-agent"] || "",
        ip: req.ip || "",
    };
    const response = await responseService.submitResponse(slug, {
        answers,
        completionTime,
        meta,
    });
    sendSuccess(res, {
        statusCode: 201,
        message: "Response recorded",
        data: { id: response._id || response.id },
    });
});

export const getResponses = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const responses = await responseService.listResponses(id, req.user!._id, {
        search: (req.query.search as string) || "",
    });
    sendSuccess(res, { data: { responses, count: responses.length } });
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analytics = await getFormAnalytics(id, req.user!._id);
    sendSuccess(res, { data: { analytics } });
});

export const deleteResponse = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await responseService.deleteResponse(id, req.user!._id);
    sendSuccess(res, { message: "Response deleted" });
});

export const exportResponses = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { form, responses } = await responseService.exportResponses(id, req.user!._id);
    const csv = responsesToCsv(form, responses);
    const filename = `${form.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_responses.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
});
