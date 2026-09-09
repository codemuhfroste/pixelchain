import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const MEMBER_COOKIE = "member_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 2 weeks

type AdminPayload = { role: "admin"; adminId: string };
type MemberPayload = { role: "member"; customerId: string };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set — see .env.example");
  return new TextEncoder().encode(secret);
}

async function sign(payload: AdminPayload | MemberPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as T;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export async function createAdminSession(adminId: string) {
  const token = await sign({ role: "admin", adminId });
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, cookieOptions);
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminSession() {
  const store = await cookies();
  return verify<AdminPayload>(store.get(ADMIN_COOKIE)?.value);
}

export async function createMemberSession(customerId: string) {
  const token = await sign({ role: "member", customerId });
  const store = await cookies();
  store.set(MEMBER_COOKIE, token, cookieOptions);
}

export async function destroyMemberSession() {
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
}

export async function getMemberSession() {
  const store = await cookies();
  return verify<MemberPayload>(store.get(MEMBER_COOKIE)?.value);
}

// Proxy (src/proxy.ts) already blocks unauthenticated page loads under
// /admin and /account, but Server Actions are reachable directly via POST
// regardless of which page rendered the form — so every mutating action
// re-checks here too. See the Next.js Data Security guide.
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Not signed in as an admin.");
  return session;
}

export async function requireMemberSession() {
  const session = await getMemberSession();
  if (!session) throw new Error("Not signed in.");
  return session;
}
