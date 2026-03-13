"use server";

import { cookies } from "next/headers";

const USER_ID_COOKIE = "study-schedule-user-id";

export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_ID_COOKIE, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_ID_COOKIE);
}
