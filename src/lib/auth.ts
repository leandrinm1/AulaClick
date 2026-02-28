import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import type { SessionUser } from "@/types";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "__aulaclick_session";
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

export async function createSession(idToken: string): Promise<void> {
  const auth = getAdminAuth();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });

  cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_MS / 1000,
    path: "/",
  });
}

export async function revokeSession(): Promise<void> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie, false);
      await auth.revokeRefreshTokens(decoded.uid);
    } catch {
      // Cookie invalid — ignore, just clear it
    }
  }

  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: (decoded.name as string) ?? "",
      avatarUrl: (decoded.picture as string) ?? "",
      username: (decoded["username"] as string) ?? "",
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
