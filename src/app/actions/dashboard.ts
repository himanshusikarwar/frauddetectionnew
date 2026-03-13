"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay } from "date-fns";

export async function getDashboardData() {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      _count: { select: { topics: true } },
      topics: { where: { status: "COMPLETED" } },
    },
  });

  const today = startOfDay(new Date());
  const todayEntries = await prisma.scheduleEntry.count({
    where: {
      subject: { userId },
      scheduledDate: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      status: "PENDING",
    },
  });

  const totalTopics = subjects.reduce((s: number, sub: { _count: { topics: number } }) => s + sub._count.topics, 0);
  const completedTopics = subjects.reduce((s: number, sub: { topics: unknown[] }) => s + sub.topics.length, 0);

  return {
    subjectCount: subjects.length,
    todayCount: todayEntries,
    totalTopics,
    completedTopics,
  };
}
