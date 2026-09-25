import { query } from "../config/db.js";
import { User } from "../types/index.js";

function mapUser(row: any): User | null {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        email: row.email,
        password: row.password_hash,
        name: row.name,
        avatarColor: row.avatar_color,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export interface CreateUserInput {
    email: string;
    password?: string;
    passwordHash?: string;
    name: string;
    avatarColor: string;
}

export async function createUser({ email, password, passwordHash, name, avatarColor }: CreateUserInput): Promise<User> {
    const hash = passwordHash || password;
    const { rows } = await query(
        `INSERT INTO users (email, password_hash, name, avatar_color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [email.toLowerCase(), hash, name, avatarColor]
    );
    const user = mapUser(rows[0])!;
    delete user.password;
    return user;
}

export async function findUserByEmail(email: string, { withPassword = false } = {}): Promise<User | null> {
    const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
    const user = mapUser(rows[0]);
    if (user && !withPassword) delete user.password;
    return user;
}

export async function findUserById(id: string, { withPassword = false } = {}): Promise<User | null> {
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    const user = mapUser(rows[0]);
    if (user && !withPassword) delete user.password;
    return user;
}

export async function updateUserProfile(id: string, { name, avatarColor }: { name?: string; avatarColor?: string }): Promise<User | null> {
    const { rows } = await query(
        `UPDATE users SET
      name = COALESCE($2, name),
      avatar_color = COALESCE($3, avatar_color)
    WHERE id = $1 RETURNING *`,
        [id, name ?? null, avatarColor ?? null]
    );
    const user = mapUser(rows[0]);
    if (user) delete user.password;
    return user;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
}

export async function deleteUser(id: string): Promise<void> {
    await query(`DELETE FROM users WHERE id = $1`, [id]);
}
