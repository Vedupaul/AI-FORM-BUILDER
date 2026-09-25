import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    if (!env.geminiApiKey) {
        throw ApiError.badRequest(
            "AI is not configured. Set GEMINI_API_KEY in the backend .env to enable AI features."
        );
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    }
    return client;
}

export async function generateJson<T = any>(prompt: string, { schemaHint = "" }: { schemaHint?: string } = {}): Promise<T> {
    const ai = getClient();

    const fullPrompt = `${prompt}

${schemaHint ? `Return ONLY valid minified JSON matching this shape:\n${schemaHint}` : ""}
Do not include markdown code fences or any prose. Output JSON only.`;

    let text: string | undefined;
    try {
        const result = await ai.models.generateContent({
            model: env.geminiModel,
            contents: fullPrompt,
            config: { responseMimeType: "application/json", temperature: 0.7 },
        });
        text = result.text;
    } catch (err: any) {
        throw ApiError.internal(`AI request failed: ${err.message}`);
    }

    return parseJson<T>(text);
}

export async function generateText(prompt: string): Promise<string> {
    const ai = getClient();
    try {
        const result = await ai.models.generateContent({
            model: env.geminiModel,
            contents: prompt,
            config: { temperature: 0.7 },
        });
        return result.text?.trim() || "";
    } catch (err: any) {
        throw ApiError.internal(`AI request failed: ${err.message}`);
    }
}

function parseJson<T = any>(raw?: string): T {
    if (!raw) throw ApiError.internal("AI returned an empty response");
    let cleaned = raw.trim();

    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        throw ApiError.internal("AI returned malformed JSON. Please try again.");
    }
}
