import { ApiError } from "../utils/ApiError.js";
import * as formRepo from "../repositories/form.repo.js";
import { Form } from "../types/index.js";
import { cacheGet, cacheSet, cacheDel } from "../config/redis.js";

async function getOwnedForm(formId: string, userId: string): Promise<Form> {
    const form = await formRepo.findFormById(formId);
    if (!form) throw ApiError.notFound("Form not found");
    if (form.owner.toString() !== userId.toString()) {
        throw ApiError.forbidden("You do not have access to this form");
    }
    return form;
}

export async function listForms(userId: string, opts: { search?: string; filter?: string } = {}): Promise<Form[]> {
    return formRepo.listFormsByOwner(userId, opts);
}

export async function getFormById(formId: string, userId: string): Promise<Form> {
    return getOwnedForm(formId, userId);
}

export async function getPublicForm(slug: string): Promise<Form> {
    const cacheKey = `cache:form:slug:${slug}`;
    const cached = await cacheGet<Form>(cacheKey);
    if (cached) {
        return cached;
    }

    const form = await formRepo.findPublishedBySlug(slug);
    if (!form) throw ApiError.notFound("This form is not available");

    // Cache public form schema for 1 hour (3600 seconds)
    await cacheSet(cacheKey, form, 3600);
    return form;
}

export async function registerView(slug: string): Promise<void> {
    await formRepo.incrementViews(slug);
}

export async function createForm(userId: string, payload: Partial<Form> = {}): Promise<Form> {
    return formRepo.createForm(userId, payload);
}

export async function updateForm(formId: string, userId: string, updates: Partial<Form>): Promise<Form | null> {
    const form = await getOwnedForm(formId, userId);

    const allowed = ["title", "description", "theme", "questions", "settings", "isFavorite", "isArchived"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
        if (key in updates) patch[key] = (updates as any)[key];
    }
    const updated = await formRepo.updateForm(formId, patch);

    // Invalidate Redis cache for public form
    if (form.slug) {
        await cacheDel(`cache:form:slug:${form.slug}`);
    }
    return updated;
}

export async function setPublishState(formId: string, userId: string, shouldPublish: boolean): Promise<Form | null> {
    const form = await getOwnedForm(formId, userId);

    if (shouldPublish && form.questions.length === 0) {
        throw ApiError.badRequest("Add at least one question before publishing");
    }

    const updated = await formRepo.updateForm(formId, {
        status: shouldPublish ? "published" : "draft",
        publishedAt: shouldPublish ? new Date() : null,
    });

    // Invalidate Redis cache
    if (form.slug) {
        await cacheDel(`cache:form:slug:${form.slug}`);
    }

    return updated;
}

export async function duplicateForm(formId: string, userId: string): Promise<Form> {
    const form = await getOwnedForm(formId, userId);
    return formRepo.createForm(userId, {
        title: `${form.title} (Copy)`,
        description: form.description,
        theme: form.theme,
        questions: form.questions,
        settings: form.settings,
        status: "draft",
    });
}

export async function deleteForm(formId: string, userId: string): Promise<void> {
    const form = await getOwnedForm(formId, userId);
    await formRepo.deleteForm(formId);

    // Invalidate cache
    if (form.slug) {
        await cacheDel(`cache:form:slug:${form.slug}`);
    }
}

export { getOwnedForm };
