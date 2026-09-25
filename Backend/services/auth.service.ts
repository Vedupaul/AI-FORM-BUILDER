import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/tokens.js";
import {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword,
} from "../repositories/user.repo.js";
import { PublicUser, User } from "../types/index.js";

const AVATAR_COLORS = ["#4f46e5", "#2563eb", "#7c3aed", "#d97706", "#ea580c", "#059669"];

function pickAvatarColor(seed: string): string {
    const sum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function toPublicUser(user: User): PublicUser {
    return {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
    };
}

export async function registerUser({
    name,
    email,
    password,
}: {
    name: string;
    email: string;
    password: string;
}): Promise<{ user: PublicUser; token: string }> {
    if (name.trim().length < 2) throw ApiError.badRequest("Name must be at least 2 characters");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw ApiError.badRequest("Please provide a valid email");
    if (password.length < 6) throw ApiError.badRequest("Password must be at least 6 characters");

    const existing = await findUserByEmail(email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const hash = await bcrypt.hash(password, 10);
    const user = await createUser({
        name: name.trim(),
        email,
        passwordHash: hash,
        avatarColor: pickAvatarColor(email),
    });

    const token = signToken({ id: user._id || user.id });
    return { user: toPublicUser(user), token };
}

export async function loginUser({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<{ user: PublicUser; token: string }> {
    const user = await findUserByEmail(email, { withPassword: true });
    if (!user || !user.password) throw ApiError.unauthorized("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

    const token = signToken({ id: user._id || user.id });
    return { user: toPublicUser(user), token };
}

export async function updateProfile(userId: string, { name }: { name?: string }): Promise<PublicUser> {
    const user = await updateUserProfile(userId, { name });
    if (!user) throw ApiError.notFound("User not found");
    return toPublicUser(user);
}

export async function changePassword(
    userId: string,
    { currentPassword, newPassword }: { currentPassword?: string; newPassword?: string }
): Promise<void> {
    if (!currentPassword || !newPassword) throw ApiError.badRequest("Current and new password are required");
    if (newPassword.length < 6) throw ApiError.badRequest("New password must be at least 6 characters");

    const user = await findUserById(userId, { withPassword: true });
    if (!user || !user.password) throw ApiError.notFound("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw ApiError.badRequest("Current password is incorrect");

    await updateUserPassword(userId, await bcrypt.hash(newPassword, 10));
}
