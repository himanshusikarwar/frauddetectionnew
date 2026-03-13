import { cookies } from "next/headers";

const USER_ID_COOKIE = "study-schedule-user-id";

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE)?.value;
  if (!userId) return null;
  return { userId };
}
