import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const SESSION_COOKIE_NAME = "oriiko_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  auth_provider: string;
  created_at: string;
}

export function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getSigningSecret(): string {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "oriiko-dev-session-secret"
  );
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function signToken(rawToken: string): string {
  const hmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(rawToken)
    .digest("hex");
  return `${rawToken}.${hmac}`;
}

export function verifySignedCookie(cookieValue: string): string | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [rawToken, providedSig] = parts;
  if (!rawToken || !providedSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(rawToken)
    .digest("hex");

  const providedBuf = Buffer.from(providedSig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");

  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  return rawToken;
}

export function createSessionTokens() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const signedCookie = signToken(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  ).toISOString();

  return { rawToken, tokenHash, signedCookie, expiresAt };
}

export async function setSessionCookie(signedCookie: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getRawSessionTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawCookie) return null;
  return verifySignedCookie(rawCookie);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const rawToken = await getRawSessionTokenFromCookie();
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const supabase = getDbClient();

  const { data, error } = await supabase.rpc("get_user_by_session", {
    p_token_hash: tokenHash,
  });

  if (error || !data) return null;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  const user = row as AuthUser & { role: string };
  return {
    ...user,
    role: user.role === "admin" ? "admin" : "customer",
  };
}

export async function requireAdminSession(): Promise<{
  user: AuthUser;
  tokenHash: string;
  supabase: ReturnType<typeof getDbClient>;
} | null> {
  const rawToken = await getRawSessionTokenFromCookie();
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const supabase = getDbClient();

  const { data, error } = await supabase.rpc("get_user_by_session", {
    p_token_hash: tokenHash,
  });

  if (error || !data) return null;

  const row = (Array.isArray(data) ? data[0] : data) as
    | (AuthUser & { role: string })
    | undefined;
  if (!row || row.role !== "admin") return null;

  return {
    user: { ...row, role: "admin" },
    tokenHash,
    supabase,
  };
}

