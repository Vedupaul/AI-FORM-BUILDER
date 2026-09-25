import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as formService from "../services/form.service.js";

export const getForms = asyncHandler(async (req: Request, res: Response) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const filter = typeof req.query.filter === "string" ? req.query.filter : undefined;
    const forms = await formService.listForms(req.user!._id, { search, filter });
    sendSuccess(res, { data: { forms } });
});

export const getForm = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const form = await formService.getFormById(id, req.user!._id);
    sendSuccess(res, { data: { form } });
});

export const getPublicForm = asyncHandler(async (req: Request, res: Response) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    await formService.registerView(slug);
    const form = await formService.getPublicForm(slug);
    sendSuccess(res, { data: { form } });
});

export const createForm = asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.createForm(req.user!._id, req.body);
    sendSuccess(res, {
        statusCode: 201,
        message: "Form created",
        data: { form },
    });
});

export const updateForm = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const form = await formService.updateForm(id, req.user!._id, req.body);
    sendSuccess(res, { message: "Form saved", data: { form } });
});

export const publishForm = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const shouldPublish = req.body.publish !== false;
    const form = await formService.setPublishState(id, req.user!._id, shouldPublish);
    sendSuccess(res, {
        message: shouldPublish ? "Form published" : "Form unpublished",
        data: { form },
    });
});

export const duplicateForm = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const form = await formService.duplicateForm(id, req.user!._id);
    sendSuccess(res, { statusCode: 201, message: "Form duplicated", data: { form } });
});

export const deleteForm = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await formService.deleteForm(id, req.user!._id);
    sendSuccess(res, { message: "Form deleted" });
});
