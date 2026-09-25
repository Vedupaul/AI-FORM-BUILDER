import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as aiService from "../services/ai.service.js";

export const generateForm = asyncHandler(async (req, res) => {
    const form = await aiService.generateForm(req.body.prompt);
    sendSuccess(res, { data: { form } });
});

export const generateValidation = asyncHandler(async (req, res) => {
    const validation = await aiService.generateValidation(req.body);
    sendSuccess(res, { data: { validation } });
});

export const improveQuestion = asyncHandler(async (req, res) => {
    const question = await aiService.improveQuestion(req.body);
    sendSuccess(res, { data: { question } });
});

export const formSummary = asyncHandler(async (req, res) => {
    const summary = await aiService.summarizeForm(req.body.form);
    sendSuccess(res, { data: { summary } });
});