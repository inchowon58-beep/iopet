import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ADMIN } from "./admin-config";
import { getSponsorLogin } from "./sponsor-login";

export type AuthRole = "admin" | "sponsor";
export type AuthSession = { role: AuthRole; user: string };

const COOKIE = "jm_admin_session";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "petfuneral-admin-secret-2026"
);

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN.username && password === ADMIN.password;
}

export async function validateSponsorCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const login = await getSponsorLogin();
  return username === login.username && password === login.password;
}

export async function createSession(role: AuthRole, user: string): Promise<string> {
  return new SignJWT({ role, user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role === "sponsor" ? "sponsor" : payload.role === "admin" ? "admin" : null;
    const user = typeof payload.user === "string" ? payload.user : "";
    if (!role || !user) return null;
    return { role, user };
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getSession());
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export { COOKIE as ADMIN_COOKIE };
