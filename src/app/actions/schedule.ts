"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay } from "date-fns";
import { generateSchedule } from "@/lib/scheduling";
import { rescheduleFromMissed } from "@/lib/rescheduling";

export async function generateScheduleForSubject(
  subjectId: string,
  startDate: Date
) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
    include: { studyDayPreferences: true, topics: { orderBy: { order: "asc" } } },
  });
  if (!subject) return { ok: false, error: "Subject not found" };
  if (subject.studyDayPreferences.length === 0) return { ok: false, error: "Select at least one study day" };
  if (subject.topics.length === 0) return { ok: false, error: "Add at least one topic" };

  const studyDayOfWeek = subject.studyDayPreferences.map((p: { dayOfWeek: number }) => p.dayOfWeek);
  const start = startOfDay(startDate);

  const slots = generateSchedule({
    startDate: start,
    studyDayOfWeek,
    topics: subject.topics.map((t: { id: string; order: number }) => ({ id: t.id, order: t.order })),
    topicsPerDay: subject.topicsPerDay,
  });

  await prisma.scheduleEntry.deleteMany({ where: { subjectId } });
  await prisma.scheduleEntry.createMany({
    data: slots.map((s) => ({
      subjectId,
      topicId: s.topicId,
      scheduledDate: s.scheduledDate,
      slotIndex: s.slotIndex,
      status: "PENDING",
    })),
  });

  await prisma.subject.update({
    where: { id: subjectId },
    data: { scheduleStartDate: subject.scheduleStartDate ?? start },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/today");
  revalidatePath("/calendar");
  return { ok: true };
}

export async function clearScheduleForSubject(subjectId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { ok: false, error: "Subject not found" };

  await prisma.scheduleEntry.deleteMany({ where: { subjectId } });
  await prisma.subject.update({
    where: { id: subjectId },
    data: { scheduleStartDate: null },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/today");
  revalidatePath("/calendar");
  return { ok: true };
}

export async function markSessionCompleted(entryId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const entry = await prisma.scheduleEntry.findFirst({
    where: { id: entryId },
    include: { subject: true },
  });
  if (!entry || entry.subject.userId !== userId) return { ok: false, error: "Not found" };
  if (entry.status !== "PENDING") return { ok: false, error: "Already completed or missed" };

  await prisma.$transaction([
    prisma.scheduleEntry.update({
      where: { id: entryId },
      data: { status: "COMPLETED" },
    }),
    prisma.topic.update({
      where: { id: entry.topicId },
      data: { status: "COMPLETED" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath(`/subjects/${entry.subjectId}`);
  revalidatePath("/calendar");
  return { ok: true };
}

export async function markSessionMissed(entryId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const entry = await prisma.scheduleEntry.findFirst({
    where: { id: entryId },
    include: { subject: { include: { studyDayPreferences: true } }, topic: true },
  });
  if (!entry || entry.subject.userId !== userId) return { ok: false, error: "Not found" };
  if (entry.status !== "PENDING") return { ok: false, error: "Already completed or missed" };

  const missedDate = startOfDay(entry.scheduledDate);
  const studyDayOfWeek = entry.subject.studyDayPreferences.map((p: { dayOfWeek: number }) => p.dayOfWeek);

  const allPendingTopics = await prisma.topic.findMany({
    where: { subjectId: entry.subjectId, status: "PENDING" },
    orderBy: { order: "asc" },
  });
  const pendingTopicIds = allPendingTopics.map((t: { id: string }) => t.id);

  await prisma.scheduleEntry.update({
    where: { id: entryId },
    data: { status: "MISSED" },
  });

  if (pendingTopicIds.length > 0) {
    const newSlots = rescheduleFromMissed({
      missedDate,
      studyDayOfWeek,
      topicsPerDay: entry.subject.topicsPerDay,
      pendingTopicIds,
    });

    await prisma.scheduleEntry.deleteMany({
      where: {
        subjectId: entry.subjectId,
        status: "PENDING",
      },
    });

    await prisma.scheduleEntry.createMany({
      data: newSlots.map((s) => ({
        subjectId: entry.subjectId,
        topicId: s.topicId,
        scheduledDate: s.scheduledDate,
        slotIndex: s.slotIndex,
        status: "PENDING",
      })),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath(`/subjects/${entry.subjectId}`);
  revalidatePath("/calendar");
  return { ok: true };
}
