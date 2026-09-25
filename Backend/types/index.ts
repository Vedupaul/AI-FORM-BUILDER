export interface User {
    id: string;
    _id: string;
    email: string;
    password?: string;
    name: string;
    avatarColor: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    createdAt: Date | string;
}

export type FieldType =
    | "short_text"
    | "long_text"
    | "email"
    | "phone"
    | "number"
    | "dropdown"
    | "radio"
    | "checkbox"
    | "date"
    | "rating"
    | "file"
    | "yes_no"
    | "address"
    | "url"
    | "password"
    | "section"
    | "heading"
    | "paragraph"
    | "image";

export interface QuestionOption {
    id: string;
    label: string;
    value: string;
}

export interface QuestionValidation {
    minLength?: number | null;
    maxLength?: number | null;
    min?: number | null;
    max?: number | null;
    pattern?: string;
    message?: string;
}

export interface Question {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    description?: string;
    helpText?: string;
    required: boolean;
    defaultValue?: string | string[];
    options?: QuestionOption[];
    content?: string;
    validation?: QuestionValidation;
    order?: number;
}

export interface FormSettings {
    logo?: string;
    primaryColor?: string;
    background?: string;
    borderRadius?: number;
    thankYouMessage?: string;
    submitButtonText?: string;
    seoTitle?: string;
    seoDescription?: string;
    showProgressBar?: boolean;
}

export type FormStatus = "draft" | "published";

export interface Form {
    _id: string;
    id?: string;
    owner: string;
    title: string;
    description: string;
    theme: string;
    status: FormStatus;
    slug: string;
    questions: Question[];
    settings: FormSettings;
    views: number;
    responseCount: number;
    isFavorite: boolean;
    isArchived: boolean;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Answer {
    questionId: string;
    label: string;
    type: FieldType;
    value: any;
}

export interface ResponseMeta {
    userAgent?: string;
    ip?: string;
    [key: string]: any;
}

export interface FormResponse {
    _id: string;
    id?: string;
    form: string;
    answers: Answer[];
    completionTime: number;
    meta: ResponseMeta;
    submittedAt: Date | string;
}

export interface JWTPayload {
    id: string;
    [key: string]: any;
}
