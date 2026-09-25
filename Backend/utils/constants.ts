import { FieldType, FormStatus } from "../types/index.js";

export const FIELD_TYPES: FieldType[] = [
    "short_text",
    "long_text",
    "email",
    "phone",
    "number",
    "dropdown",
    "radio",
    "checkbox",
    "date",
    "rating",
    "file",
    "yes_no",
    "address",
    "url",
    "password",
    "section",
    "heading",
    "paragraph",
    "image",
];

export const STATIC_FIELD_TYPES: FieldType[] = ["section", "heading", "paragraph", "image"];
export const OPTION_FIELD_TYPES: FieldType[] = ["dropdown", "radio", "checkbox"];
export const FORM_STATUS: FormStatus[] = ["draft", "published"];

export const THEMES: string[] = [
    "minimal",
    "modern",
    "corporate",
    "gradient",
    "dark",
    "glassmorphism",
];
